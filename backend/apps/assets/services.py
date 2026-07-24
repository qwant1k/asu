"""Сервисный слой для складских операций ИС «АСУ»."""

from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    MOVEMENT_RECEIPT,
    MOVEMENT_ISSUE,
    MOVEMENT_TRANSFER,
    MOVEMENT_WRITE_OFF,
    ASSIGNMENT_ACTIVE,
    ASSIGNMENT_TRANSFERRED,
    ASSIGNMENT_WRITTEN_OFF,
    NOTIFICATION_STOCK_ALERT,
)

from .models import WarehouseStock, AssetAssignment, StockMovement, StockAlertRule, StockAlertState


class StockService:
    """Сервис складских операций. Все операции выполняются атомарно."""

    @staticmethod
    @transaction.atomic
    def receive_stock(asset, quantity, price, document=None, performed_by=None, location='', warehouse=None):
        """
        Оприходование актива на склад.

        Args:
            asset: экземпляр Asset
            quantity: количество (Decimal)
            price: цена за единицу (Decimal)
            document: документ-основание (опционально)
            performed_by: пользователь, выполнивший операцию
            location: место хранения
        """
        quantity = Decimal(str(quantity))
        price = Decimal(str(price))

        stock, created = WarehouseStock.objects.get_or_create(
            asset=asset,
            defaults={'quantity': 0, 'total_amount': 0, 'location': location, 'warehouse': warehouse},
        )
        stock.quantity += quantity
        stock.total_amount = stock.quantity * asset.unit_price
        if warehouse:
            stock.warehouse = warehouse
        if location:
            stock.location = location
        stock.save()

        movement = StockMovement.objects.create(
            asset=asset,
            movement_type=MOVEMENT_RECEIPT,
            quantity=quantity,
            unit_price=price,
            total_amount=quantity * price,
            performed_by=performed_by,
            warehouse=stock.warehouse,
        )

        if document:
            from django.contrib.contenttypes.models import ContentType
            movement.document_type = ContentType.objects.get_for_model(document)
            movement.document_id = document.pk
            movement.save(update_fields=['document_type', 'document_id'])

        return movement

    @staticmethod
    @transaction.atomic
    def issue_stock(asset, quantity, to_user, document=None, performed_by=None):
        """
        Выдача актива со склада сотруднику.

        Raises:
            ValueError: если недостаточно остатков на складе.
        """
        quantity = Decimal(str(quantity))

        try:
            stock = WarehouseStock.objects.select_for_update().get(asset=asset)
        except WarehouseStock.DoesNotExist:
            raise ValueError(_('Актив отсутствует на складе'))

        if stock.quantity < quantity:
            raise ValueError(
                _('Недостаточно остатков на складе. '
                  'Доступно: %(available)s, запрошено: %(requested)s') % {
                    'available': stock.quantity,
                    'requested': quantity,
                }
            )

        stock.quantity -= quantity
        stock.total_amount = stock.quantity * asset.unit_price
        stock.save()

        movement = StockMovement.objects.create(
            asset=asset,
            movement_type=MOVEMENT_ISSUE,
            quantity=quantity,
            unit_price=asset.unit_price,
            total_amount=quantity * asset.unit_price,
            to_user=to_user,
            performed_by=performed_by,
            warehouse=stock.warehouse,
        )

        if document:
            from django.contrib.contenttypes.models import ContentType
            movement.document_type = ContentType.objects.get_for_model(document)
            movement.document_id = document.pk
            movement.save(update_fields=['document_type', 'document_id'])

        # Закрепление за сотрудником (для ОС, НМА, ТМЗ длит. пользования)
        if asset.asset_type in ('OS', 'NMA') or asset.is_long_term_use:
            AssetAssignment.objects.create(
                asset=asset,
                user=to_user,
                quantity=quantity,
                assigned_by=performed_by,
                warehouse=stock.warehouse,
                location=stock.location,
                status=ASSIGNMENT_ACTIVE,
            )

        return movement

    @staticmethod
    @transaction.atomic
    def transfer_stock(asset, quantity, from_user, to_user, document=None, performed_by=None):
        """
        Перемещение актива между сотрудниками.

        Raises:
            ValueError: если у сотрудника нет закреплённого актива.
        """
        quantity = Decimal(str(quantity))

        # Обновляем закрепление у отправителя
        assignments = AssetAssignment.objects.select_for_update().filter(
            asset=asset,
            user=from_user,
            status=ASSIGNMENT_ACTIVE,
        ).order_by('assigned_at')
        if not assignments.exists():
            raise ValueError(
                _('У сотрудника %(user)s нет закреплённого актива %(asset)s') % {
                    'user': from_user.get_short_name(),
                    'asset': asset.name,
                }
            )

        assignment = assignments.first()
        if assignment.quantity < quantity:
            raise ValueError(
                _('Недостаточно закрепленного количества. '
                  'Доступно: %(available)s, запрошено: %(requested)s') % {
                    'available': assignment.quantity,
                    'requested': quantity,
                }
            )

        if assignment.quantity == quantity:
            assignment.status = ASSIGNMENT_TRANSFERRED
            assignment.save(update_fields=['status'])
        else:
            assignment.quantity -= quantity
            assignment.save(update_fields=['quantity'])

        # Создаём новое закрепление у получателя
        AssetAssignment.objects.create(
            asset=asset,
            user=to_user,
            quantity=quantity,
            assigned_by=performed_by,
            warehouse=assignment.warehouse,
            location=assignment.location,
            status=ASSIGNMENT_ACTIVE,
        )

        movement = StockMovement.objects.create(
            asset=asset,
            movement_type=MOVEMENT_TRANSFER,
            quantity=quantity,
            unit_price=asset.unit_price,
            total_amount=quantity * asset.unit_price,
            from_user=from_user,
            to_user=to_user,
            performed_by=performed_by,
            warehouse=assignment.warehouse,
        )

        if document:
            from django.contrib.contenttypes.models import ContentType
            movement.document_type = ContentType.objects.get_for_model(document)
            movement.document_id = document.pk
            movement.save(update_fields=['document_type', 'document_id'])

        return movement

    @staticmethod
    @transaction.atomic
    def write_off_stock(asset, quantity, document=None, performed_by=None, comment=''):
        """
        Списание актива.

        Raises:
            ValueError: если недостаточно остатков.
        """
        quantity = Decimal(str(quantity))

        try:
            stock = WarehouseStock.objects.select_for_update().get(asset=asset)
        except WarehouseStock.DoesNotExist:
            raise ValueError(_('Актив отсутствует на складе'))

        if stock.quantity < quantity:
            raise ValueError(
                _('Недостаточно остатков для списания. '
                  'Доступно: %(available)s, запрошено: %(requested)s') % {
                    'available': stock.quantity,
                    'requested': quantity,
                }
            )

        stock.quantity -= quantity
        stock.total_amount = stock.quantity * asset.unit_price
        stock.save()

        # Обновляем закрепления
        AssetAssignment.objects.filter(
            asset=asset,
            status=ASSIGNMENT_ACTIVE,
        ).update(status=ASSIGNMENT_WRITTEN_OFF)

        movement = StockMovement.objects.create(
            asset=asset,
            movement_type=MOVEMENT_WRITE_OFF,
            quantity=quantity,
            unit_price=asset.unit_price,
            total_amount=quantity * asset.unit_price,
            performed_by=performed_by,
            warehouse=stock.warehouse,
            comment=comment,
        )

        if document:
            from django.contrib.contenttypes.models import ContentType
            movement.document_type = ContentType.objects.get_for_model(document)
            movement.document_id = document.pk
            movement.save(update_fields=['document_type', 'document_id'])

        return movement


class StockAlertService:
    """Контроль критических остатков и создание складских алармов."""

    @staticmethod
    def render_message(rule, stock):
        asset = stock.asset
        template = rule.message_template or '{asset_name} на исходе, требуется срочное пополнение склада. Остаток: {quantity} {unit}.'
        try:
            return template.format(
                asset_name=asset.name,
                asset_code=asset.code,
                quantity=stock.quantity,
                threshold=rule.threshold_quantity,
                unit=asset.unit_of_measure,
                warehouse=stock.warehouse.name if stock.warehouse_id else stock.location,
            )
        except (KeyError, ValueError):
            return f'{asset.name} на исходе, требуется срочное пополнение склада. Остаток: {stock.quantity} {asset.unit_of_measure}.'

    @staticmethod
    def rule_matches_stock(rule, stock):
        asset = stock.asset
        if rule.warehouses.exists() and stock.warehouse_id not in set(rule.warehouses.values_list('id', flat=True)):
            return False

        asset_ids = set(rule.assets.values_list('id', flat=True))
        group_ids = set(rule.groups.values_list('id', flat=True))

        if not asset_ids and not group_ids:
            return True

        if asset.id in asset_ids:
            return True

        related_group_ids = {asset.category_id}
        if asset.group_id:
            related_group_ids.add(asset.group_id)
        return bool(group_ids.intersection(related_group_ids))

    @staticmethod
    def notify_recipients(rule, state):
        from apps.notifications.services import NotificationService

        for recipient in rule.recipients.filter(is_active=True):
            NotificationService.send(
                recipient=recipient,
                notification_type=NOTIFICATION_STOCK_ALERT,
                title='Критический остаток на складе',
                body=state.message,
                related_object=state.stock,
            )
        state.last_notified_at = timezone.now()
        state.save(update_fields=['last_notified_at'])

    @staticmethod
    def evaluate_stock(stock):
        matched_rule_ids = []
        rules = StockAlertRule.objects.filter(is_active=True).prefetch_related(
            'recipients', 'groups', 'assets', 'warehouses',
        )

        for rule in rules:
            if not StockAlertService.rule_matches_stock(rule, stock):
                continue

            matched_rule_ids.append(rule.id)
            is_critical = stock.quantity <= rule.threshold_quantity
            state = StockAlertState.objects.filter(rule=rule, stock=stock).first()

            if is_critical:
                message = StockAlertService.render_message(rule, stock)
                if not state:
                    state = StockAlertState.objects.create(
                        rule=rule,
                        stock=stock,
                        is_active=True,
                        current_quantity=stock.quantity,
                        message=message,
                    )
                    StockAlertService.notify_recipients(rule, state)
                else:
                    was_inactive = not state.is_active
                    state.is_active = True
                    state.current_quantity = stock.quantity
                    state.message = message
                    state.resolved_at = None
                    state.save(update_fields=['is_active', 'current_quantity', 'message', 'resolved_at'])
                    if was_inactive:
                        StockAlertService.notify_recipients(rule, state)
            elif state and state.is_active:
                state.is_active = False
                state.current_quantity = stock.quantity
                state.resolved_at = timezone.now()
                state.save(update_fields=['is_active', 'current_quantity', 'resolved_at'])

        inactive_qs = StockAlertState.objects.filter(stock=stock, is_active=True)
        if matched_rule_ids:
            inactive_qs = inactive_qs.exclude(rule_id__in=matched_rule_ids)
        inactive_qs.update(is_active=False, current_quantity=stock.quantity, resolved_at=timezone.now())

    @staticmethod
    def evaluate_rule(rule):
        stocks = WarehouseStock.objects.select_related(
            'asset', 'asset__category', 'asset__group', 'warehouse',
        )
        for stock in stocks:
            StockAlertService.evaluate_stock(stock)
