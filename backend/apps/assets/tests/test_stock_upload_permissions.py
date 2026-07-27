from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User, UserAccessOverride


class StockUploadPermissionTests(TestCase):
    endpoint = '/api/v1/assets/upload-stock/'

    def setUp(self):
        self.client = APIClient()

    def test_legacy_warehouse_upload_permission_is_not_enough(self):
        user = User.objects.create_user(
            username='warehouse-uploader',
            password='test-password',
        )
        UserAccessOverride.objects.create(
            user=user,
            permission_code='warehouse.upload',
            mode=UserAccessOverride.MODE_GRANT,
        )
        self.client.force_authenticate(user)

        response = self.client.post(
            self.endpoint,
            {'asset_type': 'TMZ'},
            format='multipart',
        )

        self.assertEqual(response.status_code, 403)

    def test_system_admin_can_reach_upload_validation(self):
        admin = User.objects.create_superuser(
            username='stock-upload-admin',
            password='test-password',
            email='stock-upload-admin@example.test',
        )
        self.client.force_authenticate(admin)

        response = self.client.post(
            self.endpoint,
            {'asset_type': 'TMZ'},
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('detail', response.data)
