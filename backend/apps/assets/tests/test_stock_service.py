"""Unit-тесты для StockService."""
import pytest
from decimal import Decimal
from django.test import TestCase

from apps.assets.services import StockService
from apps.assets.models import WarehouseStock, StockMovement
from apps.common.constants import MOVEMENT_RECEIPT, MOVEMENT_ISSUE


@pytest.mark.django_db
class TestStockServiceReceive(TestCase):
    """Тесты оприходования на склад."""

    def setUp(self):
        from apps.references.models import Asset, AssetCategory, UnitOfMeasure
        from apps.references.models import Warehouse

        self.unit, _ = UnitOfMeasure.objects.get_or_create(name='шт', defaults={'code': 'PCS'})
        self.category = AssetCategory.objects.create(name='ТМЗ', code='TMZ', asset_type='TMZ')
        self.warehouse = Warehouse.objects.create(name='Склад 1', code='WH1')
        self.asset = Asset.objects.create(
            name='Тестовый актив',
            asset_type='TMZ',
            code='ASSET-1',
            category=self.category,
            unit_of_measure='шт',
            unit_of_measure_ref=self.unit,
            unit_price=Decimal('100.00'),
        )

    def test_receive_creates_stock(self):
        """Оприходование создаёт остаток."""
        StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('10'),
            price=Decimal('100.00'),
            warehouse=self.warehouse,
        )
        stock = WarehouseStock.objects.get(asset=self.asset)
        self.assertEqual(stock.quantity, Decimal('10'))

    def test_receive_accumulates_stock(self):
        """Повторное оприходование накапливает остаток."""
        StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('10'),
            price=Decimal('100.00'),
            warehouse=self.warehouse,
        )
        StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('5'),
            price=Decimal('100.00'),
            warehouse=self.warehouse,
        )
        stock = WarehouseStock.objects.get(asset=self.asset)
        self.assertEqual(stock.quantity, Decimal('15'))

    def test_receive_creates_movement(self):
        """Оприходование создаёт движение."""
        movement = StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('10'),
            price=Decimal('100.00'),
            warehouse=self.warehouse,
        )
        self.assertEqual(movement.movement_type, MOVEMENT_RECEIPT)
        self.assertEqual(movement.quantity, Decimal('10'))


@pytest.mark.django_db
class TestStockServiceIssue(TestCase):
    """Тесты выдачи со склада."""

    def setUp(self):
        from apps.references.models import Asset, AssetCategory, UnitOfMeasure, Warehouse
        from apps.users.models import User

        self.unit, _ = UnitOfMeasure.objects.get_or_create(name='шт', defaults={'code': 'PCS'})
        self.category = AssetCategory.objects.create(name='ТМЗ', code='TMZ', asset_type='TMZ')
        self.warehouse = Warehouse.objects.create(name='Склад 2', code='WH2')
        self.asset = Asset.objects.create(
            name='Тестовый актив 2',
            asset_type='TMZ',
            code='ASSET-2',
            category=self.category,
            unit_of_measure='шт',
            unit_of_measure_ref=self.unit,
            unit_price=Decimal('50.00'),
        )
        self.user = User.objects.create_user(
            username='recipient', password='test123',
        )
        StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('20'),
            price=Decimal('50.00'),
            warehouse=self.warehouse,
        )

    def test_issue_reduces_stock(self):
        """Выдача уменьшает остаток."""
        StockService.issue_stock(
            asset=self.asset,
            quantity=Decimal('5'),
            to_user=self.user,
        )
        stock = WarehouseStock.objects.get(asset=self.asset)
        self.assertEqual(stock.quantity, Decimal('15'))

    def test_issue_insufficient_raises(self):
        """Выдача больше остатка вызывает ошибку."""
        with self.assertRaises(ValueError):
            StockService.issue_stock(
                asset=self.asset,
                quantity=Decimal('100'),
                to_user=self.user,
            )

    def test_issue_nonexistent_stock_raises(self):
        """Выдача несуществующего остатка вызывает ошибку."""
        from apps.references.models import Asset

        new_asset = Asset.objects.create(
            name='Новый актив',
            code='ASSET-NEW',
            asset_type='TMZ',
            category=self.category,
            unit_of_measure='шт',
            unit_of_measure_ref=self.unit,
            unit_price=Decimal('10.00'),
        )
        with self.assertRaises(ValueError):
            StockService.issue_stock(
                asset=new_asset,
                quantity=Decimal('1'),
                to_user=self.user,
            )


@pytest.mark.django_db
class TestStockServiceWriteOff(TestCase):
    """Тесты списания со склада."""

    def setUp(self):
        from apps.references.models import Asset, AssetCategory, UnitOfMeasure, Warehouse

        self.unit, _ = UnitOfMeasure.objects.get_or_create(name='шт', defaults={'code': 'PCS'})
        self.category = AssetCategory.objects.create(name='ТМЗ', code='TMZ', asset_type='TMZ')
        self.warehouse = Warehouse.objects.create(name='Склад 3', code='WH3')
        self.asset = Asset.objects.create(
            name='Актив для списания',
            asset_type='TMZ',
            code='ASSET-3',
            category=self.category,
            unit_of_measure='шт',
            unit_of_measure_ref=self.unit,
            unit_price=Decimal('30.00'),
        )
        StockService.receive_stock(
            asset=self.asset,
            quantity=Decimal('10'),
            price=Decimal('30.00'),
            warehouse=self.warehouse,
        )

    def test_write_off_reduces_stock(self):
        """Списание уменьшает остаток."""
        StockService.write_off_stock(
            asset=self.asset,
            quantity=Decimal('3'),
            comment='Износ',
        )
        stock = WarehouseStock.objects.get(asset=self.asset)
        self.assertEqual(stock.quantity, Decimal('7'))

    def test_write_off_exceeding_raises(self):
        """Списание больше остатка вызывает ошибку."""
        with self.assertRaises(ValueError):
            StockService.write_off_stock(
                asset=self.asset,
                quantity=Decimal('100'),
                comment='Износ',
            )
