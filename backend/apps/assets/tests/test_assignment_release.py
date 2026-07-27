from decimal import Decimal

from django.test import TestCase

from apps.assets.models import AssetAssignment, StockMovement
from apps.assets.services import StockService
from apps.common.constants import ASSIGNMENT_ACTIVE, ASSIGNMENT_RELEASED, MOVEMENT_UNASSIGN
from apps.references.models import Asset, AssetCategory, UnitOfMeasure, Warehouse
from apps.users.models import User


class AssignmentReleaseTests(TestCase):
    def setUp(self):
        unit, _ = UnitOfMeasure.objects.get_or_create(name='шт', defaults={'code': 'PCS'})
        category = AssetCategory.objects.create(
            name='ОС для снятия',
            code='RELEASE-OS',
            asset_type='OS',
        )
        self.warehouse = Warehouse.objects.create(name='Основной склад', code='RELEASE-WH')
        self.asset = Asset.objects.create(
            name='Ноутбук',
            code='RELEASE-ASSET',
            asset_type='OS',
            category=category,
            unit_of_measure='шт',
            unit_of_measure_ref=unit,
            unit_price=Decimal('250000'),
            inventory_number='INV-RELEASE-1',
        )
        self.employee = User.objects.create_user(username='release_employee', password='test123')
        self.admin = User.objects.create_user(
            username='release_admin',
            password='test123',
            role='ADMIN',
        )
        self.regular_user = User.objects.create_user(
            username='release_regular',
            password='test123',
        )
        self.assignment = AssetAssignment.objects.create(
            asset=self.asset,
            user=self.employee,
            quantity=Decimal('1'),
            assigned_by=self.admin,
            warehouse=self.warehouse,
            status=ASSIGNMENT_ACTIVE,
        )

    def test_admin_releases_assignment_and_keeps_history(self):
        released = StockService.release_assignment(
            self.assignment,
            released_by=self.admin,
            reason='Исправление ошибочного закрепления',
        )

        self.assertEqual(released.status, ASSIGNMENT_RELEASED)
        self.assertIsNotNone(released.released_at)
        self.assertEqual(released.released_by, self.admin)
        self.assertEqual(released.user, self.employee)
        self.assertTrue(
            StockMovement.objects.filter(
                asset=self.asset,
                movement_type=MOVEMENT_UNASSIGN,
                from_user=self.employee,
            ).exists()
        )

    def test_regular_user_cannot_release_assignment(self):
        with self.assertRaises(ValueError):
            StockService.release_assignment(
                self.assignment,
                released_by=self.regular_user,
            )

        self.assignment.refresh_from_db()
        self.assertEqual(self.assignment.status, ASSIGNMENT_ACTIVE)
