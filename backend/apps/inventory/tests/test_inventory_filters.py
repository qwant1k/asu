from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from apps.assets.models import AssetAssignment
from apps.references.models import Asset, AssetCategory, UnitOfMeasure
from apps.users.models import User


class InventoryMolFilterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='inventory_admin',
            password='test123',
            role='ADMIN',
        )
        self.first_mol = User.objects.create_user(username='first_mol', password='test123')
        self.second_mol = User.objects.create_user(username='second_mol', password='test123')
        unit, _ = UnitOfMeasure.objects.get_or_create(name='шт', defaults={'code': 'PCS'})
        category = AssetCategory.objects.create(
            name='Инвентарный тест',
            code='INVENTORY-TEST',
            asset_type='OS',
        )
        for index, mol in enumerate((self.first_mol, self.second_mol), start=1):
            asset = Asset.objects.create(
                name=f'Актив {index}',
                code=f'INVENTORY-ASSET-{index}',
                asset_type='OS',
                category=category,
                unit_of_measure='шт',
                unit_of_measure_ref=unit,
                unit_price=Decimal('1000'),
                inventory_number=f'INV-FILTER-{index}',
            )
            AssetAssignment.objects.create(
                asset=asset,
                user=mol,
                quantity=1,
                assigned_by=self.admin,
            )
        self.client.force_authenticate(self.admin)

    def test_inventory_cards_filter_by_mol(self):
        response = self.client.get(
            '/api/v1/inventory/inventory-cards/',
            {'mol_id': self.first_mol.id},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_count'], 1)
        self.assertEqual(response.data['items'][0]['user'], self.first_mol.id)

    def test_mol_options_contains_users_with_active_assignments(self):
        response = self.client.get('/api/v1/inventory/mols/')

        self.assertEqual(response.status_code, 200)
        ids = {item['id'] for item in response.data}
        self.assertEqual(ids, {self.first_mol.id, self.second_mol.id})
