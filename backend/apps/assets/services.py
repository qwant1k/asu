"""Сервисный слой для складских операций ИС «АСУ»."""

from decimal import Decimal
from django.db import transaction
from django.utils.translation import gettext_lazy as _

from apps.common.constants import (
    MOVEMENT_RECEIPT,
    MOVEMENT_ISSUE,
    MOVEMENT_TRANSFER,
    MOVEMENT_WRITE_OFF,
    ASSIGNMENT_ACTIVE,
    ASSIGNMENT_TRANSFERRED,
    ASSIGNMENT_WRITTEN_OFF,
)

from .models import WarehouseStock, AssetAssignment, StockMovement


class StockService:
    """Сервис складских операций. Все операции выполняются атомарно."""

    @staticmethod
    @transaction.atomic
    def receive_stock(asset, quantity, price, document=None, performed_by=None, location=''):
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
            defaults={'quantity': 0, 'total_amount': 0, 'location': location},
        )
        stock.quantity += quantity
        stock.total_amount = stock.quantity * asset.unit_price
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
        assignments = AssetAssignment.objects.filter(
            asset=asset,
            user=from_user,
            status=ASSIGNMENT_ACTIVE,
        )
        if not assignments.exists():
            raise ValueError(
                _('У сотрудника %(user)s нет закреплённого актива %(asset)s') % {
                    'user': from_user.get_short_name(),
                    'asset': asset.name,
                }
            )

        assignment = assignments.first()
        assignment.status = ASSIGNMENT_TRANSFERRED
        assignment.save(update_fields=['status'])

        # Создаём новое закрепление у получателя
        AssetAssignment.objects.create(
            asset=asset,
            user=to_user,
            quantity=quantity,
            assigned_by=performed_by,
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
            comment=comment,
        )

        if document:
            from django.contrib.contenttypes.models import ContentType
            movement.document_type = ContentType.objects.get_for_model(document)
            movement.document_id = document.pk
            movement.save(update_fields=['document_type', 'document_id'])

        return movement
