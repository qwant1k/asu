from django.contrib.auth.models import Permission
from django.test import TransactionTestCase
from rest_framework.test import APIClient

from apps.references.models import UnitOfMeasure
from apps.users.models import Department, User


class DatabaseResetApiTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.password = 'Admin-test-password-1'
        self.admin = User.objects.create_superuser(
            username='database-admin',
            password=self.password,
            email='database-admin@example.test',
            first_name='System',
            last_name='Administrator',
        )
        self.client = APIClient()

    def test_only_superuser_can_reset_database(self):
        regular_user = User.objects.create_user(
            username='regular-user',
            password='Regular-test-password-1',
        )
        self.client.force_authenticate(regular_user)

        response = self.client.post(
            '/api/v1/users/database-reset/',
            {
                'current_password': 'Regular-test-password-1',
                'confirmation': 'ОЧИСТИТЬ БАЗУ',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(pk=self.admin.pk).exists())
        self.assertTrue(User.objects.filter(pk=regular_user.pk).exists())

    def test_wrong_confirmation_does_not_delete_anything(self):
        unit = UnitOfMeasure.objects.create(name='Штука', code='PCE')
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            '/api/v1/users/database-reset/',
            {
                'current_password': self.password,
                'confirmation': 'очистить',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(UnitOfMeasure.objects.filter(pk=unit.pk).exists())

    def test_wrong_password_does_not_delete_anything(self):
        unit = UnitOfMeasure.objects.create(name='Комплект', code='SET')
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            '/api/v1/users/database-reset/',
            {
                'current_password': 'wrong-password',
                'confirmation': 'ОЧИСТИТЬ БАЗУ',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(UnitOfMeasure.objects.filter(pk=unit.pk).exists())

    def test_reset_preserves_only_requesting_admin_and_system_permissions(self):
        department = Department.objects.create(name='Тестовое подразделение', code='TEST')
        self.admin.department = department
        self.admin.save(update_fields=['department'])
        User.objects.create_user(
            username='deleted-user',
            password='Deleted-test-password-1',
            department=department,
        )
        UnitOfMeasure.objects.create(name='Штука', code='PCE')
        permissions_before = Permission.objects.count()
        admin_id = self.admin.pk
        password_hash = self.admin.password
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            '/api/v1/users/database-reset/',
            {
                'current_password': self.password,
                'confirmation': 'ОЧИСТИТЬ БАЗУ',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.count(), 1)
        preserved_admin = User.objects.get()
        self.assertEqual(preserved_admin.pk, admin_id)
        self.assertEqual(preserved_admin.password, password_hash)
        self.assertTrue(preserved_admin.is_superuser)
        self.assertTrue(preserved_admin.is_staff)
        self.assertTrue(preserved_admin.is_active)
        self.assertIsNone(preserved_admin.department_id)
        self.assertEqual(Department.objects.count(), 0)
        self.assertEqual(UnitOfMeasure.objects.count(), 0)
        self.assertEqual(Permission.objects.count(), permissions_before)
