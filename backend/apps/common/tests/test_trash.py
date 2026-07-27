from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from rest_framework.test import APIClient

from apps.common.models import TrashItem
from apps.common.trash import move_to_trash, restore_from_trash
from apps.references.models import UnitOfMeasure
from apps.users.models import PositionAccessRule, User, UserAccessOverride


class TrashApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='trash-admin',
            password='test-password',
            email='trash-admin@example.test',
        )
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_delete_hides_object_and_restore_returns_it(self):
        unit = UnitOfMeasure.objects.create(name='Упаковка', code='PACK')

        response = self.client.delete(
            f'/api/v1/references/units-of-measure/{unit.pk}/',
        )

        self.assertEqual(response.status_code, 204)
        unit.refresh_from_db()
        self.assertFalse(unit.is_active)
        self.assertTrue(UnitOfMeasure.objects.filter(pk=unit.pk).exists())

        content_type = ContentType.objects.get_for_model(UnitOfMeasure)
        trash_item = TrashItem.objects.get(
            content_type=content_type,
            object_id=str(unit.pk),
        )

        list_response = self.client.get('/api/v1/references/units-of-measure/')
        returned_ids = {
            item['id']
            for item in list_response.data['results']
        }
        self.assertNotIn(unit.pk, returned_ids)

        trash_response = self.client.get('/api/v1/trash/')
        self.assertEqual(trash_response.status_code, 200)
        self.assertEqual(trash_response.data['results'][0]['status'], 'DELETED')

        restore_response = self.client.post(
            f'/api/v1/trash/{trash_item.pk}/restore/',
        )
        self.assertEqual(restore_response.status_code, 200)

        unit.refresh_from_db()
        self.assertTrue(unit.is_active)
        self.assertFalse(TrashItem.objects.filter(pk=trash_item.pk).exists())

        list_response = self.client.get('/api/v1/references/units-of-measure/')
        returned_ids = {
            item['id']
            for item in list_response.data['results']
        }
        self.assertIn(unit.pk, returned_ids)

    def test_purge_removes_object_from_database(self):
        unit = UnitOfMeasure.objects.create(name='Комплект', code='SET')
        self.client.delete(
            f'/api/v1/references/units-of-measure/{unit.pk}/',
        )
        trash_item = TrashItem.objects.get(object_id=str(unit.pk))

        response = self.client.delete(
            f'/api/v1/trash/{trash_item.pk}/purge/',
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(UnitOfMeasure.objects.filter(pk=unit.pk).exists())
        self.assertFalse(TrashItem.objects.filter(pk=trash_item.pk).exists())

    def test_create_with_same_unique_identity_restores_trashed_object(self):
        unit = UnitOfMeasure.objects.create(name='Коробка', code='BOX')
        self.client.delete(
            f'/api/v1/references/units-of-measure/{unit.pk}/',
        )

        response = self.client.post(
            '/api/v1/references/units-of-measure/',
            {'name': 'Коробка', 'code': 'BOX', 'is_active': True},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['id'], unit.pk)
        self.assertEqual(
            UnitOfMeasure.objects.filter(pk=unit.pk, name='Коробка').count(),
            1,
        )
        unit.refresh_from_db()
        self.assertTrue(unit.is_active)
        self.assertFalse(TrashItem.objects.filter(object_id=str(unit.pk)).exists())

    def test_restore_preserves_previously_inactive_state(self):
        unit = UnitOfMeasure.objects.create(
            name='Неактивная единица',
            code='INACTIVE',
            is_active=False,
        )

        trash_item = move_to_trash(unit, self.admin)
        restore_from_trash(trash_item)

        unit.refresh_from_db()
        self.assertFalse(unit.is_active)

    def test_access_rules_can_be_enabled_again_after_soft_delete(self):
        rule = PositionAccessRule.objects.create(
            position='Бухгалтер',
            permission_code='reports.view',
            is_allowed=True,
        )
        self.client.delete(
            f'/api/v1/users/access/position-rules/{rule.pk}/',
        )

        rule_response = self.client.post(
            '/api/v1/users/access/position-rules/',
            {
                'position': 'Бухгалтер',
                'permission_code': 'reports.view',
                'is_allowed': True,
                'is_active': True,
            },
            format='json',
        )

        self.assertEqual(rule_response.status_code, 201)
        self.assertEqual(rule_response.data['id'], rule.pk)

        target_user = User.objects.create_user(
            username='override-target',
            password='test-password',
        )
        override = UserAccessOverride.objects.create(
            user=target_user,
            permission_code='warehouse.view',
            mode=UserAccessOverride.MODE_GRANT,
        )
        self.client.delete(
            f'/api/v1/users/access/user-overrides/{override.pk}/',
        )

        override_response = self.client.post(
            '/api/v1/users/access/user-overrides/',
            {
                'user': target_user.pk,
                'permission_code': 'warehouse.view',
                'mode': UserAccessOverride.MODE_GRANT,
            },
            format='json',
        )

        self.assertEqual(override_response.status_code, 201)
        self.assertEqual(override_response.data['id'], override.pk)

    def test_trash_is_not_available_to_regular_user(self):
        regular_user = User.objects.create_user(
            username='trash-regular',
            password='test-password',
        )
        self.client.force_authenticate(regular_user)

        response = self.client.get('/api/v1/trash/')

        self.assertEqual(response.status_code, 403)
