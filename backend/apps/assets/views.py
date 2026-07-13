"""Views активов и склада ИС «АСУ»."""

from decimal import Decimal, InvalidOperation
from datetime import datetime

from django.db import transaction
from django.utils.translation import gettext_lazy as _
from openpyxl import load_workbook
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.constants import (
    ASSET_TYPE_OS,
    ASSET_TYPE_TMZ,
    MOVEMENT_INVENTORY_ADJUSTMENT,
    ROLE_ADMIN,
    ROLE_MOL_NMA,
    ROLE_MOL_WAREHOUSE,
)
from apps.references.models import Asset, AssetCategory
from apps.users.access import has_access

from .filters import AssignmentFilter, MovementFilter, WarehouseStockFilter
from .models import WarehouseStock, AssetAssignment, StockMovement
from .serializers import (
    WarehouseStockSerializer,
    AssetAssignmentSerializer,
    StockMovementSerializer,
)


class CanUploadStock:
    """Разрешение только для администраторов и МОЛ."""

    UPLOAD_ROLES = {ROLE_ADMIN, ROLE_MOL_WAREHOUSE, ROLE_MOL_NMA}

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role in self.UPLOAD_ROLES or has_access(request.user, 'warehouse.upload'))
        )


class StockUploadView(APIView):
    """Загрузка остатков ТМЗ/ОС из Excel на выбранную дату."""

    permission_classes = [CanUploadStock]

    # Распознаваемые заголовки столбцов (рус / каз / англ)
    COLUMN_MAP = {
        'код': 'code',
        'код номенклатуры': 'code',
        'code': 'code',
        'артикул': 'code',
        'наименование': 'name',
        'название': 'name',
        'name': 'name',
        'наименование товара': 'name',
        'товар': 'name',
        'единицa измерения': 'unit',
        'ед. изм.': 'unit',
        'единица измерения': 'unit',
        'unit': 'unit',
        'unit of measure': 'unit',
        'количество': 'quantity',
        'кол-во': 'quantity',
        'qty': 'quantity',
        'quantity': 'quantity',
        'остаток': 'quantity',
        'цена': 'unit_price',
        'цена за единицу': 'unit_price',
        'unit price': 'unit_price',
        'price': 'unit_price',
        'сумма': 'total_amount',
        'total': 'total_amount',
        'total amount': 'total_amount',
        'сумма всего': 'total_amount',
        'категория': 'category',
        'category': 'category',
        'группа': 'category',
        'место хранения': 'location',
        'location': 'location',
        'склад': 'location',
    }

    def post(self, request):
        asset_type = request.query_params.get('asset_type') or request.data.get('asset_type')
        if asset_type not in (ASSET_TYPE_TMZ, ASSET_TYPE_OS):
            return Response(
                {'detail': _('asset_type должен быть TMZ или OS')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        balance_date_str = request.query_params.get('balance_date') or request.data.get('balance_date')
        balance_date = None
        if balance_date_str:
            try:
                balance_date = datetime.strptime(balance_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'detail': _('balance_date должен быть в формате YYYY-MM-DD')},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'detail': _('Необходимо приложить файл')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            wb = load_workbook(file_obj, data_only=True)
            ws = wb.active
        except Exception as exc:
            return Response(
                {'detail': _('Не удалось прочитать Excel: ') + str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not ws or ws.max_row < 2:
            return Response(
                {'detail': _('Файл пуст или не содержит данных')},
                status=status.HTTP_400_BAD_REQUEST,
            )

        headers = self._parse_headers(ws[1])
        required = {'code', 'name', 'unit', 'quantity'}
        missing = required - set(headers.values())
        if missing:
            return Response(
                {'detail': _('Отсутствуют обязательные столбцы: ') + ', '.join(missing)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        default_category, _default_category_created = AssetCategory.objects.get_or_create(
            code=f'UPLOAD_{asset_type}',
            defaults={
                'name': _('Загружено из Excel') + f' ({asset_type})',
                'asset_type': asset_type,
            },
        )

        rows = []
        errors = []
        created_assets = 0
        updated_assets = 0
        created_stock = 0
        updated_stock = 0

        for idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            values = dict(zip(headers.keys(), row))
            mapped = {headers[col]: values[col] for col in headers if values[col] is not None}

            code = str(mapped.get('code', '')).strip()
            name = str(mapped.get('name', '')).strip()
            unit = str(mapped.get('unit', '')).strip()
            if not code or not name or not unit:
                errors.append({'row': idx, 'detail': _('Пропущен обязательный реквизит')})
                continue

            try:
                quantity = self._to_decimal(mapped.get('quantity'), 2)
                if quantity is None:
                    raise ValueError
            except (ValueError, InvalidOperation):
                errors.append({'row': idx, 'detail': _('Некорректное количество')})
                continue

            unit_price = self._to_decimal(mapped.get('unit_price'), 2)
            total_amount = self._to_decimal(mapped.get('total_amount'), 2)
            if total_amount is None and unit_price is not None:
                total_amount = (unit_price * quantity).quantize(Decimal('0.01'))
            elif unit_price is None and total_amount is not None and quantity:
                unit_price = (total_amount / quantity).quantize(Decimal('0.01'))
            elif unit_price is None:
                unit_price = Decimal('0')
            if total_amount is None:
                total_amount = (unit_price * quantity).quantize(Decimal('0.01'))

            category_name = str(mapped.get('category', '')).strip()
            category = default_category
            if category_name:
                category, _category_created = AssetCategory.objects.get_or_create(
                    name=category_name,
                    asset_type=asset_type,
                    defaults={
                        'code': f'CAT_{category_name}'[:50],
                    },
                )

            location = str(mapped.get('location', '')).strip()

            rows.append({
                'idx': idx,
                'code': code,
                'name': name,
                'unit': unit,
                'quantity': quantity,
                'unit_price': unit_price,
                'total_amount': total_amount,
                'category': category,
                'location': location,
            })

        with transaction.atomic():
            for item in rows:
                asset, asset_created = Asset.objects.update_or_create(
                    code=item['code'],
                    defaults={
                        'name': item['name'],
                        'asset_type': asset_type,
                        'category': item['category'],
                        'unit_of_measure': item['unit'],
                        'unit_price': item['unit_price'],
                        'balance_date': balance_date,
                    },
                )
                if asset_created:
                    created_assets += 1
                else:
                    updated_assets += 1

                existing_stock = WarehouseStock.objects.select_for_update().filter(asset=asset).first()
                old_quantity = existing_stock.quantity if existing_stock else Decimal('0')
                old_total = existing_stock.total_amount if existing_stock else Decimal('0')

                stock, stock_created = WarehouseStock.objects.update_or_create(
                    asset=asset,
                    defaults={
                        'quantity': item['quantity'],
                        'total_amount': item['total_amount'],
                        'balance_date': balance_date,
                        'location': item['location'] or (asset.warehouse_stock.location if hasattr(asset, 'warehouse_stock') else ''),
                    },
                )
                if stock_created:
                    created_stock += 1
                else:
                    updated_stock += 1

                quantity_delta = stock.quantity - old_quantity
                total_delta = stock.total_amount - old_total
                if quantity_delta or stock_created:
                    StockMovement.objects.create(
                        asset=asset,
                        movement_type=MOVEMENT_INVENTORY_ADJUSTMENT,
                        quantity=quantity_delta,
                        unit_price=item['unit_price'],
                        total_amount=total_delta,
                        performed_by=request.user,
                        comment=_('Корректировка остатка по загрузке Excel'),
                    )

        return Response({
            'success': True,
            'asset_type': asset_type,
            'balance_date': balance_date,
            'processed': len(rows),
            'created_assets': created_assets,
            'updated_assets': updated_assets,
            'created_stock': created_stock,
            'updated_stock': updated_stock,
            'errors': errors,
        })

    def _parse_headers(self, header_row):
        headers = {}
        for idx, cell in enumerate(header_row):
            if cell.value is None:
                continue
            key = str(cell.value).strip().lower()
            mapped = self.COLUMN_MAP.get(key)
            if mapped:
                headers[idx] = mapped
        return headers

    def _to_decimal(self, value, places):
        if value is None or value == '':
            return None
        if isinstance(value, (int, float)):
            return Decimal(str(value)).quantize(Decimal('0.1') ** places)
        return Decimal(str(value).replace(' ', '').replace(',', '.')).quantize(Decimal('0.1') ** places)


class WarehouseStockViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    """Просмотр остатков на складе."""
    queryset = WarehouseStock.objects.select_related('asset', 'asset__category', 'asset__group').all()
    serializer_class = WarehouseStockSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = WarehouseStockFilter
    search_fields = ['asset__name', 'asset__code', 'location']
    ordering_fields = ['quantity', 'total_amount', 'updated_at']


class AssetAssignmentViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                             viewsets.GenericViewSet):
    """Просмотр закреплений активов."""
    queryset = AssetAssignment.objects.select_related(
        'asset', 'asset__category', 'asset__group', 'user', 'assigned_by',
    ).all()
    serializer_class = AssetAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = AssignmentFilter
    search_fields = ['asset__name', 'user__last_name']
    ordering_fields = ['assigned_at', 'status']


class StockMovementViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin,
                           viewsets.GenericViewSet):
    """Просмотр журнала движения активов."""
    queryset = StockMovement.objects.select_related(
        'asset', 'asset__category', 'asset__group', 'from_user', 'to_user', 'performed_by',
    ).all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = MovementFilter
    search_fields = ['asset__name', 'comment']
    ordering_fields = ['performed_at', 'total_amount']
