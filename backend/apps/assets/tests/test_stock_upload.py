from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from openpyxl import Workbook
from rest_framework.test import APIClient

from apps.common.constants import ASSET_TYPE_NMA, ASSET_TYPE_OS, ASSET_TYPE_TMZ
from apps.references.models import Asset, AssetCategory, UnitOfMeasure, Warehouse
from apps.users.models import User


class StockUploadTests(TestCase):
    preview_endpoint = '/api/v1/assets/upload-stock/preview/'
    confirm_endpoint = '/api/v1/assets/upload-stock/confirm/'
    headers = [
        'Тип актива',
        'Код номенклатуры',
        'Наименование',
        'Единица измерения',
        'Количество',
        'Цена за единицу',
        'Сумма',
        'Категория',
        'Место хранения',
    ]

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='stock-import-admin',
            password='test-password',
            email='stock-import-admin@example.test',
        )
        self.client.force_authenticate(self.admin)

    @staticmethod
    def _excel_content(headers, rows):
        workbook = Workbook()
        sheet = workbook.active
        sheet.append(headers)
        for row in rows:
            sheet.append(row)
        content = BytesIO()
        workbook.save(content)
        return content.getvalue()

    @staticmethod
    def _file(content, name='stock.xlsx'):
        return SimpleUploadedFile(
            name,
            content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )

    def _preview(self, rows):
        content = self._excel_content(self.headers, rows)
        response = self.client.post(
            self.preview_endpoint,
            {
                'file': self._file(content),
                'balance_date': '2026-07-27',
            },
            format='multipart',
        )
        return response, content

    def _confirm(self, content, preview_token, **overrides):
        return self.client.post(
            self.confirm_endpoint,
            {
                'file': self._file(content),
                'balance_date': '2026-07-27',
                'preview_token': preview_token,
                **overrides,
            },
            format='multipart',
        )

    def _upload(self, rows):
        preview, content = self._preview(rows)
        self.assertEqual(preview.status_code, 200, preview.data)
        self.assertTrue(preview.data['can_confirm'], preview.data)
        return self._confirm(content, preview.data['preview_token'])

    def test_type_column_is_required(self):
        response = self.client.post(
            self.preview_endpoint,
            {
                'file': self._file(self._excel_content(
                    self.headers[1:],
                    [['CODE-1', 'Наименование', 'шт', 1, 10, 10, 'Категория', 'Склад']],
                )),
            },
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('Тип актива', response.data['detail'])

    def test_mixed_asset_types_and_normalized_reference_matching(self):
        existing_unit, _ = UnitOfMeasure.objects.get_or_create(
            name='шт',
            defaults={'code': 'UOM-EXISTING'},
        )
        existing_warehouse, _ = Warehouse.objects.get_or_create(
            name='Основной склад',
            defaults={'code': 'WH-EXISTING'},
        )
        existing_category, _ = AssetCategory.objects.get_or_create(
            name='Офисная техника',
            asset_type=ASSET_TYPE_OS,
            defaults={'code': 'CAT-EXISTING'},
        )

        rows = [
            [
                'О С',
                '220000001',
                'Монитор',
                ' Ш Т ',
                2,
                125000,
                250000,
                'офиснаятехника',
                'ОСНОВНОЙСКЛАД',
            ],
            [
                'НМА',
                '220000001',
                'Лицензия',
                ' лицензия ',
                1,
                300000,
                300000,
                'Программное   обеспечение',
                'Электронный архив',
            ],
            [
                'тмз',
                '220000001',
                'Бумага',
                'ш т',
                10,
                2500,
                25000,
                'Канцелярские товары',
                ' основной склад ',
            ],
        ]

        response = self._upload(rows)

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['processed'], 3)
        self.assertEqual(response.data['skipped'], 0)
        self.assertEqual(
            response.data['asset_types'],
            [ASSET_TYPE_OS, ASSET_TYPE_NMA, ASSET_TYPE_TMZ],
        )

        os_asset = Asset.objects.get(code='ОС220000001')
        self.assertEqual(os_asset.asset_type, ASSET_TYPE_OS)
        self.assertEqual(os_asset.unit_of_measure_ref, existing_unit)
        self.assertEqual(os_asset.category, existing_category)
        self.assertEqual(os_asset.warehouse_stocks.get().warehouse, existing_warehouse)

        nma_asset = Asset.objects.get(code='НМА220000001')
        self.assertEqual(nma_asset.asset_type, ASSET_TYPE_NMA)
        self.assertEqual(nma_asset.unit_of_measure_ref.name, 'лицензия')
        self.assertEqual(nma_asset.category.name, 'Программное обеспечение')
        self.assertEqual(nma_asset.warehouse_stocks.get().warehouse.name, 'Электронный архив')

        tmz_asset = Asset.objects.get(code='ТМЗ220000001')
        self.assertEqual(tmz_asset.asset_type, ASSET_TYPE_TMZ)
        self.assertEqual(tmz_asset.unit_of_measure_ref, existing_unit)
        self.assertEqual(tmz_asset.warehouse_stocks.get().warehouse, existing_warehouse)

        created = response.data['created_references']
        self.assertEqual([item['name'] for item in created['units']], ['лицензия'])
        self.assertEqual(
            [item['name'] for item in created['warehouses']],
            ['Электронный архив'],
        )
        self.assertCountEqual(
            [item['name'] for item in created['categories']],
            ['Программное обеспечение', 'Канцелярские товары'],
        )

        prefixed_rows = [list(row) for row in rows]
        prefixed_rows[0][1] = 'ОС 220000001'
        prefixed_rows[1][1] = 'NMA-220000001'
        prefixed_rows[2][1] = 'ТМЗ220000001'
        repeat_response = self._upload(prefixed_rows)
        self.assertEqual(repeat_response.status_code, 200, repeat_response.data)
        self.assertEqual(Asset.objects.count(), 3)
        self.assertEqual(
            repeat_response.data['created_references'],
            {'units': [], 'warehouses': [], 'categories': []},
        )

    def test_preview_does_not_change_database_before_confirmation(self):
        rows = [
            ['TMZ', 'PREVIEW-ONLY', 'Предпросмотр', 'шт', 1, 10, 10, 'Категория', 'Склад'],
        ]

        preview, content = self._preview(rows)

        self.assertEqual(preview.status_code, 200, preview.data)
        self.assertTrue(preview.data['can_confirm'])
        self.assertEqual(preview.data['summary']['valid_rows'], 1)
        self.assertEqual(preview.data['rows'][0]['code'], 'ТМЗPREVIEW-ONLY')
        self.assertFalse(Asset.objects.filter(code='ТМЗPREVIEW-ONLY').exists())

        confirmed = self._confirm(content, preview.data['preview_token'])
        self.assertEqual(confirmed.status_code, 200, confirmed.data)
        self.assertEqual(confirmed.data['stage'], 'confirmed')
        self.assertTrue(Asset.objects.filter(code='ТМЗPREVIEW-ONLY').exists())

    def test_invalid_type_blocks_confirmation_and_writes_nothing(self):
        rows = [
            ['Материал', 'BAD-TYPE', 'Ошибка', 'шт', 1, 10, 10, 'Категория', 'Склад'],
            ['TMZ', 'VALID-TYPE', 'Корректная строка', 'шт', 1, 10, 10, 'Категория', 'Склад'],
        ]
        preview, content = self._preview(rows)

        self.assertEqual(preview.status_code, 200, preview.data)
        self.assertFalse(preview.data['can_confirm'])
        self.assertEqual(preview.data['summary']['valid_rows'], 1)
        self.assertEqual(preview.data['summary']['invalid_rows'], 1)
        self.assertEqual(preview.data['errors'][0]['row'], 2)
        response = self._confirm(content, preview.data['preview_token'])
        self.assertEqual(response.status_code, 400, response.data)
        self.assertFalse(Asset.objects.filter(code='BAD-TYPE').exists())
        self.assertFalse(Asset.objects.filter(code='ТМЗVALID-TYPE').exists())

    def test_confirmation_rejects_changed_context(self):
        preview, content = self._preview([
            ['TMZ', 'CHANGED-CONTEXT', 'Проверка', 'шт', 1, 10, 10, 'Категория', 'Склад'],
        ])
        self.assertEqual(preview.status_code, 200, preview.data)

        response = self._confirm(
            content,
            preview.data['preview_token'],
            balance_date='2026-07-28',
        )

        self.assertEqual(response.status_code, 400, response.data)
        self.assertFalse(Asset.objects.filter(code='ТМЗCHANGED-CONTEXT').exists())
