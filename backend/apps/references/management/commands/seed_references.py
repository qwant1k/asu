"""
Management command: seed_references
Наполняет БД тестовыми данными для демонстрации ИС «АСУ».
Запуск: python manage.py seed_references
"""

import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.users.models import Department, User
from apps.references.models import (
    Counterparty, LimitNorm, RequestType, AssetCategory, Asset,
)
from apps.assets.models import WarehouseStock
from apps.common.constants import (
    ROLE_ADMIN, ROLE_AHS_WORKER, ROLE_AHS_HEAD,
    ROLE_MOL_WAREHOUSE, ROLE_MOL_NMA, ROLE_FO_HEAD,
    ROLE_DEPT_HEAD, ROLE_USER, ROLE_COMMISSION_MEMBER, ROLE_IRD_WORKER,
    ASSET_TYPE_TMZ, ASSET_TYPE_OS, ASSET_TYPE_NMA,
    ASSET_TYPE_REPRESENTATIVE_TMZ,
    PERIOD_MONTHLY, PERIOD_QUARTERLY, PERIOD_ANNUAL,
)


class Command(BaseCommand):
    help = 'Заполняет справочники тестовыми данными для ИС «АСУ»'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write('═══ Наполнение справочников ═══')

        departments = self._seed_departments()
        users = self._seed_users(departments)
        self._seed_counterparties()
        categories = self._seed_categories()
        assets = self._seed_assets(categories)
        self._seed_request_types()
        self._seed_limits(departments)
        self._seed_warehouse_stock(assets)

        self.stdout.write(self.style.SUCCESS('✅ Все справочники успешно наполнены'))

    # ─── Подразделения ───────────────────────────────────────────────

    def _seed_departments(self):
        self.stdout.write('  📁 Подразделения...')
        data = [
            ('АХС', 'Административно-хозяйственная служба'),
            ('ФО', 'Финансовый отдел'),
            ('ДИТ', 'Департамент информационных технологий'),
            ('ЮД', 'Юридический департамент'),
            ('ОСМР', 'Отдел по связям с общественностью'),
            ('ИРД', 'Инвестиционно-ресурсный департамент'),
            ('ОВА', 'Отдел внутреннего аудита'),
            ('СБ', 'Служба безопасности'),
            ('БУХ', 'Бухгалтерия'),
            ('КАНЦ', 'Канцелярия'),
        ]
        result = {}
        for code, name in data:
            dept, created = Department.objects.get_or_create(
                code=code,
                defaults={'name': name},
            )
            result[code] = dept
            if created:
                self.stdout.write(f'    + {name}')
        return result

    # ─── Пользователи ────────────────────────────────────────────────

    def _seed_users(self, depts):
        self.stdout.write('  👤 Пользователи...')

        users_data = [
            # (username, email, first, last, patron, position, role, dept_code)
            ('admin', 'admin@kfgd.kz', 'Администратор', 'Системный', '',
             'Системный администратор', ROLE_ADMIN, 'ДИТ'),

            ('ahs_worker1', 'ahs1@kfgd.kz', 'Айгерим', 'Сатпаева', 'Бахытовна',
             'Специалист АХС', ROLE_AHS_WORKER, 'АХС'),
            ('ahs_worker2', 'ahs2@kfgd.kz', 'Дамир', 'Нурланов', 'Ерланович',
             'Специалист АХС', ROLE_AHS_WORKER, 'АХС'),

            ('ahs_head', 'ahs_head@kfgd.kz', 'Марат', 'Жумабеков', 'Канатович',
             'Руководитель АХС', ROLE_AHS_HEAD, 'АХС'),

            ('mol_warehouse', 'mol_wh@kfgd.kz', 'Бауыржан', 'Каримов', 'Серикович',
             'МОЛ по складу', ROLE_MOL_WAREHOUSE, 'АХС'),

            ('mol_nma', 'mol_nma@kfgd.kz', 'Гульнара', 'Абдуллина', 'Тимуровна',
             'МОЛ по НМА', ROLE_MOL_NMA, 'ДИТ'),

            ('fo_head', 'fo_head@kfgd.kz', 'Алия', 'Касымова', 'Нурлановна',
             'Руководитель ФО', ROLE_FO_HEAD, 'ФО'),

            ('dept_head_dit', 'dit_head@kfgd.kz', 'Ерлан', 'Тасмагамбетов', 'Бакытович',
             'Директор ДИТ', ROLE_DEPT_HEAD, 'ДИТ'),
            ('dept_head_yud', 'yud_head@kfgd.kz', 'Динара', 'Мусина', 'Асхатовна',
             'Директор ЮД', ROLE_DEPT_HEAD, 'ЮД'),
            ('dept_head_ird', 'ird_head@kfgd.kz', 'Нурлан', 'Сагинтаев', 'Кайратович',
             'Директор ИРД', ROLE_DEPT_HEAD, 'ИРД'),

            ('user_dit1', 'user1@kfgd.kz', 'Асем', 'Жанибекова', 'Ерболатовна',
             'Ведущий разработчик', ROLE_USER, 'ДИТ'),
            ('user_fo1', 'user2@kfgd.kz', 'Тимур', 'Искаков', 'Маратович',
             'Бухгалтер', ROLE_USER, 'ФО'),
            ('user_yud1', 'user3@kfgd.kz', 'Камила', 'Ахметова', 'Данияровна',
             'Юрист', ROLE_USER, 'ЮД'),
            ('user_sb1', 'user4@kfgd.kz', 'Арман', 'Бекмуратов', 'Талгатович',
             'Специалист СБ', ROLE_USER, 'СБ'),

            ('commission1', 'commission@kfgd.kz', 'Сауле', 'Оразбаева', 'Мухтаровна',
             'Член Рабочей комиссии', ROLE_COMMISSION_MEMBER, 'БУХ'),

            ('ird_worker1', 'ird_w@kfgd.kz', 'Данияр', 'Кенжебаев', 'Нурланович',
             'Специалист ИРД', ROLE_IRD_WORKER, 'ИРД'),
        ]

        result = {}
        for username, email, first, last, patron, position, role, dept_code in users_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'patronymic': patron,
                    'position': position,
                    'role': role,
                    'department': depts.get(dept_code),
                    'is_active': True,
                },
            )
            pw = 'Admin1234!' if username == 'admin' else 'Test1234!'
            user.set_password(pw)
            user.save(update_fields=['password'])
            if created:
                self.stdout.write(f'    + {last} {first} ({role})')
            result[username] = user

        # Назначить руководителей подразделений
        head_map = {
            'АХС': 'ahs_head',
            'ФО': 'fo_head',
            'ДИТ': 'dept_head_dit',
            'ЮД': 'dept_head_yud',
            'ИРД': 'dept_head_ird',
        }
        for dept_code, uname in head_map.items():
            dept = depts.get(dept_code)
            if dept and uname in result:
                dept.head = result[uname]
                dept.save(update_fields=['head'])

        # Назначить supervisor (руководитель)
        supervisor_map = {
            'user_dit1': 'dept_head_dit',
            'user_fo1': 'fo_head',
            'user_yud1': 'dept_head_yud',
            'user_sb1': 'ahs_head',
            'ahs_worker1': 'ahs_head',
            'ahs_worker2': 'ahs_head',
            'mol_warehouse': 'ahs_head',
            'mol_nma': 'dept_head_dit',
            'ird_worker1': 'dept_head_ird',
        }
        for uname, sup_uname in supervisor_map.items():
            if uname in result and sup_uname in result:
                user = result[uname]
                user.supervisor = result[sup_uname]
                user.save(update_fields=['supervisor'])

        return result

    # ─── Контрагенты ─────────────────────────────────────────────────

    def _seed_counterparties(self):
        self.stdout.write('  🏢 Контрагенты...')
        data = [
            ('ТОО «Офис Маркет»', '070140012345', 'г. Алматы, ул. Абая 15',
             'Иванов И.И.', '+7 727 123 4567', 'office@officemarket.kz'),
            ('ТОО «ТехноСклад»', '080240023456', 'г. Алматы, пр. Достык 85',
             'Петров П.П.', '+7 727 234 5678', 'info@tehnosklad.kz'),
            ('АО «КазМебель»', '050340034567', 'г. Астана, ул. Кунаева 10',
             'Сидоров С.С.', '+7 717 345 6789', 'sales@kazmebel.kz'),
            ('ТОО «СофтПро»', '100440045678', 'г. Алматы, ул. Тимирязева 42',
             'Ким А.В.', '+7 727 456 7890', 'sales@softpro.kz'),
            ('ТОО «Хозснаб»', '090540056789', 'г. Алматы, ул. Толе Би 59',
             'Нуржанов К.Б.', '+7 727 567 8901', 'info@hozsnab.kz'),
            ('ИП Сейткали', '750640067890', 'г. Алматы, ул. Жандосова 15',
             'Сейткали Б.М.', '+7 777 678 9012', 'seitkali@mail.kz'),
            ('ТОО «Принт-Сервис»', '110740078901', 'г. Алматы, ул. Гагарина 74',
             'Ли В.С.', '+7 727 789 0123', 'print@printservice.kz'),
            ('ТОО «МебельПлюс»', '120840089012', 'г. Астана, пр. Республики 21',
             'Токаев Н.К.', '+7 717 890 1234', 'info@mebelplus.kz'),
            ('ТОО «АйТиСолюшнс»', '130940090123', 'г. Алматы, пр. Аль-Фараби 77',
             'Жумагалиев Д.А.', '+7 727 901 2345', 'sales@itsolutions.kz'),
            ('ТОО «КлинСервис»', '141040001234', 'г. Алматы, ул. Байтурсынова 3',
             'Омарова Г.Н.', '+7 727 012 3456', 'info@cleanservice.kz'),
        ]
        for name, bin_val, address, contact, phone, email in data:
            _, created = Counterparty.objects.get_or_create(
                bin=bin_val,
                defaults={
                    'name': name,
                    'address': address,
                    'contact_person': contact,
                    'phone': phone,
                    'email': email,
                    'is_active': True,
                },
            )
            if created:
                self.stdout.write(f'    + {name}')

    # ─── Категории активов ───────────────────────────────────────────

    def _seed_categories(self):
        self.stdout.write('  📦 Категории активов...')
        data = [
            # (code, name, asset_type)
            ('TMZ_CANC', 'Канцелярские товары', ASSET_TYPE_TMZ),
            ('TMZ_HOZ', 'Хозяйственные товары', ASSET_TYPE_TMZ),
            ('TMZ_RASH', 'Расходные материалы для оргтехники', ASSET_TYPE_TMZ),
            ('TMZ_PRED', 'Представительские товары', ASSET_TYPE_TMZ),
            ('TMZ_FOOD', 'Продукты питания', ASSET_TYPE_TMZ),

            ('OS_COMP', 'Компьютерная техника', ASSET_TYPE_OS),
            ('OS_ORG', 'Оргтехника', ASSET_TYPE_OS),
            ('OS_MEBL', 'Мебель офисная', ASSET_TYPE_OS),
            ('OS_SVYAZ', 'Средства связи', ASSET_TYPE_OS),
            ('OS_TRANS', 'Транспортные средства', ASSET_TYPE_OS),

            ('NMA_SOFT', 'Программное обеспечение', ASSET_TYPE_NMA),
            ('NMA_LIC', 'Лицензии', ASSET_TYPE_NMA),
            ('NMA_DB', 'Базы данных', ASSET_TYPE_NMA),
        ]
        result = {}
        for code, name, atype in data:
            cat, created = AssetCategory.objects.get_or_create(
                code=code,
                defaults={'name': name, 'asset_type': atype},
            )
            result[code] = cat
            if created:
                self.stdout.write(f'    + {name}')
        return result

    # ─── Активы ──────────────────────────────────────────────────────

    def _seed_assets(self, cats):
        self.stdout.write('  📋 Активы...')

        today = datetime.date.today()

        tmz = [
            ('Бумага А4 (пачка 500 л.)', 'TMZ-001', 'TMZ_CANC', 'пачка', 1200),
            ('Ручка шариковая синяя', 'TMZ-002', 'TMZ_CANC', 'шт.', 150),
            ('Скрепки 100 шт.', 'TMZ-003', 'TMZ_CANC', 'коробка', 300),
            ('Папка-регистратор А4', 'TMZ-004', 'TMZ_CANC', 'шт.', 800),
            ('Маркер перманентный', 'TMZ-005', 'TMZ_CANC', 'шт.', 450),
            ('Степлер офисный', 'TMZ-006', 'TMZ_CANC', 'шт.', 1500),
            ('Скобы для степлера №24/6', 'TMZ-007', 'TMZ_CANC', 'коробка', 200),
            ('Картридж HP LaserJet', 'TMZ-008', 'TMZ_RASH', 'шт.', 12500),
            ('Тонер для принтера Samsung', 'TMZ-009', 'TMZ_RASH', 'шт.', 8900),
            ('Чистящие салфетки для экрана', 'TMZ-010', 'TMZ_HOZ', 'уп. 100 шт.', 600),
            ('Мыло жидкое', 'TMZ-011', 'TMZ_HOZ', 'л', 500),
            ('Моющее средство для пола', 'TMZ-012', 'TMZ_HOZ', 'л', 350),
            ('Чай пакетированный', 'TMZ-013', 'TMZ_FOOD', 'уп. 100 пак.', 1800),
            ('Кофе растворимый 200 г', 'TMZ-014', 'TMZ_FOOD', 'шт.', 2500),
            ('Сахар', 'TMZ-015', 'TMZ_FOOD', 'кг', 400),
        ]

        os_items = [
            ('Ноутбук Dell Latitude 5540', 'OS_COMP', 'шт.', 450000, 60),
            ('Монитор LG 24"', 'OS_COMP', 'шт.', 95000, 60),
            ('МФУ HP LaserJet Pro', 'OS_ORG', 'шт.', 185000, 84),
            ('Рабочий стол офисный', 'OS_MEBL', 'шт.', 65000, 120),
            ('Кресло офисное', 'OS_MEBL', 'шт.', 45000, 60),
            ('Телефонный аппарат', 'OS_SVYAZ', 'шт.', 15000, 60),
            ('Сейф офисный', 'OS_MEBL', 'шт.', 120000, 120),
            ('Холодильник офисный', 'OS_ORG', 'шт.', 95000, 84),
            ('Кофемашина', 'OS_ORG', 'шт.', 250000, 60),
        ]

        nma_items = [
            ('Microsoft Office 2021', 'NMA_SOFT', 'лицензия', 85000, 36),
            ('1С:Бухгалтерия 8', 'NMA_SOFT', 'лицензия', 120000, 60),
            ('Антивирус Kaspersky (1 год)', 'NMA_LIC', 'лицензия', 15000, 12),
            ('Adobe Acrobat Pro', 'NMA_LIC', 'лицензия', 65000, 12),
            ('AutoCAD 2024', 'NMA_LIC', 'лицензия', 350000, 12),
            ('Zoom Business (1 год)', 'NMA_LIC', 'лицензия', 45000, 12),
            ('База данных НПА РК', 'NMA_DB', 'годовая подписка', 55000, 12),
            ('Антивирус ESET (1 год)', 'NMA_LIC', 'лицензия', 12000, 12),
            ('СЭД eDOC', 'NMA_SOFT', 'лицензия', 200000, 36),
            ('VPN-сервис корпоративный', 'NMA_LIC', 'лицензия', 35000, 12),
        ]

        result = {}

        # ТМЗ
        for name, code, cat_code, unit, price in tmz:
            asset, created = Asset.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'asset_type': ASSET_TYPE_TMZ,
                    'category': cats[cat_code],
                    'unit_of_measure': unit,
                    'unit_price': Decimal(str(price)),
                    'is_long_term_use': False,
                },
            )
            result[code] = asset
            if created:
                self.stdout.write(f'    + [ТМЗ] {name}')

        # ОС — генерация серий с инвентарными номерами
        os_ranges = [
            (1, 15), (16, 25), (26, 30), (31, 50), (51, 80),
            (81, 90), (91, 95), (96, 98), (99, 100),
        ]
        for idx, (name, cat_code, unit, price, useful_life) in enumerate(os_items):
            start, end = os_ranges[idx]
            for inv_num in range(start, end + 1):
                code = f'OS-{inv_num:03d}'
                inv = f'ОС-{inv_num:03d}'
                asset_name = f'{name}' if start == end else f'{name} #{inv_num}'
                asset, created = Asset.objects.get_or_create(
                    code=code,
                    defaults={
                        'name': asset_name,
                        'asset_type': ASSET_TYPE_OS,
                        'category': cats[cat_code],
                        'unit_of_measure': unit,
                        'unit_price': Decimal(str(price)),
                        'is_long_term_use': False,
                        'inventory_number': inv,
                        'balance_date': today - datetime.timedelta(days=365),
                        'useful_life_months': useful_life,
                    },
                )
                result[code] = asset
                if created and inv_num == start:
                    count = end - start + 1
                    self.stdout.write(f'    + [ОС] {name} × {count}')

        # НМА
        for idx, (name, cat_code, unit, price, useful_life) in enumerate(nma_items, 1):
            code = f'NMA-{idx:03d}'
            inv = f'НМА-{idx:03d}'
            asset, created = Asset.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'asset_type': ASSET_TYPE_NMA,
                    'category': cats[cat_code],
                    'unit_of_measure': unit,
                    'unit_price': Decimal(str(price)),
                    'is_long_term_use': False,
                    'inventory_number': inv,
                    'balance_date': today - datetime.timedelta(days=180),
                    'useful_life_months': useful_life,
                },
            )
            result[code] = asset
            if created:
                self.stdout.write(f'    + [НМА] {name}')

        return result

    # ─── Виды заявок ─────────────────────────────────────────────────

    def _seed_request_types(self):
        self.stdout.write('  📝 Виды заявок...')
        data = [
            ('TMZ_ISSUE', 'Выдача ТМЗ со склада', ASSET_TYPE_TMZ,
             'Заявка на выдачу товарно-материальных запасов со склада'),
            ('TMZ_REPRESENTATIVE', 'Выдача ТМЗ (представительские)', ASSET_TYPE_REPRESENTATIVE_TMZ,
             'Заявка на выдачу представительских ТМЗ'),
            ('OS_ISSUE', 'Выдача ОС со склада', ASSET_TYPE_OS,
             'Заявка на выдачу основных средств со склада'),
            ('OS_TRANSFER', 'Перемещение ОС', ASSET_TYPE_OS,
             'Заявка на перемещение ОС между сотрудниками'),
            ('OS_NEW_EMPLOYEE', 'Выдача ОС новому работнику', ASSET_TYPE_OS,
             'Заявка на выдачу ОС новому сотруднику при трудоустройстве'),
            ('OS_DISMISSAL', 'Перемещение ОС увольняющегося', ASSET_TYPE_OS,
             'Заявка на перемещение ОС увольняющегося сотрудника'),
            ('NMA_ISSUE', 'Выдача НМА со склада', ASSET_TYPE_NMA,
             'Заявка на выдачу нематериальных активов'),
            ('NMA_CHANGE_USER', 'Изменение пользователя НМА', ASSET_TYPE_NMA,
             'Заявка на смену пользователя НМА'),
        ]
        for code, name, atype, desc in data:
            _, created = RequestType.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'asset_type': atype,
                    'description': desc,
                    'is_active': True,
                },
            )
            if created:
                self.stdout.write(f'    + {name}')

    # ─── Лимиты и нормативы ──────────────────────────────────────────

    def _seed_limits(self, depts):
        self.stdout.write('  📏 Лимиты и нормативы...')
        today = datetime.date.today()
        year_start = today.replace(month=1, day=1)
        year_end = today.replace(month=12, day=31)

        data = [
            ('Бумага А4', ASSET_TYPE_TMZ, Decimal('5'), PERIOD_MONTHLY, None,
             year_start, year_end),
            ('Ручка шариковая', ASSET_TYPE_TMZ, Decimal('2'), PERIOD_QUARTERLY, None,
             year_start, year_end),
            ('Картридж HP LaserJet', ASSET_TYPE_TMZ, Decimal('1'), PERIOD_QUARTERLY, None,
             year_start, year_end),
            ('Чай пакетированный', ASSET_TYPE_TMZ, Decimal('2'), PERIOD_MONTHLY, 'АХС',
             year_start, year_end),
            ('Кофе растворимый', ASSET_TYPE_TMZ, Decimal('1'), PERIOD_MONTHLY, 'АХС',
             year_start, year_end),
        ]
        admin_user = User.objects.filter(role=ROLE_ADMIN).first()
        for category, atype, qty, period, dept_code, vfrom, vto in data:
            dept = depts.get(dept_code) if dept_code else None
            _, created = LimitNorm.objects.get_or_create(
                category=category,
                asset_type=atype,
                period=period,
                department=dept,
                defaults={
                    'quantity_limit': qty,
                    'valid_from': vfrom,
                    'valid_to': vto,
                    'created_by': admin_user,
                },
            )
            if created:
                dept_label = dept.name if dept else 'Весь Фонд'
                self.stdout.write(f'    + {category} — {qty}/{period} ({dept_label})')

    # ─── Остатки на складе ───────────────────────────────────────────

    def _seed_warehouse_stock(self, assets):
        self.stdout.write('  🏗️ Остатки на складе...')

        # ТМЗ — стартовые остатки
        tmz_stock = {
            'TMZ-001': 200, 'TMZ-002': 500, 'TMZ-003': 100,
            'TMZ-004': 80, 'TMZ-005': 60, 'TMZ-006': 30,
            'TMZ-007': 150, 'TMZ-008': 20, 'TMZ-009': 15,
            'TMZ-010': 50, 'TMZ-011': 40, 'TMZ-012': 30,
            'TMZ-013': 25, 'TMZ-014': 20, 'TMZ-015': 50,
        }
        count = 0
        for code, qty in tmz_stock.items():
            if code in assets:
                asset = assets[code]
                _, created = WarehouseStock.objects.get_or_create(
                    asset=asset,
                    defaults={
                        'quantity': Decimal(str(qty)),
                        'total_amount': Decimal(str(qty)) * asset.unit_price,
                        'location': 'Основной склад',
                    },
                )
                if created:
                    count += 1

        # ОС на складе (незакреплённые)
        os_on_stock = [
            f'OS-{i:03d}' for i in range(1, 101)
        ]
        for code in os_on_stock:
            if code in assets:
                asset = assets[code]
                _, created = WarehouseStock.objects.get_or_create(
                    asset=asset,
                    defaults={
                        'quantity': Decimal('1'),
                        'total_amount': asset.unit_price,
                        'location': 'Основной склад',
                    },
                )
                if created:
                    count += 1

        # НМА на складе
        for i in range(1, 11):
            code = f'NMA-{i:03d}'
            if code in assets:
                asset = assets[code]
                _, created = WarehouseStock.objects.get_or_create(
                    asset=asset,
                    defaults={
                        'quantity': Decimal('10'),
                        'total_amount': Decimal('10') * asset.unit_price,
                        'location': 'Серверное хранилище',
                    },
                )
                if created:
                    count += 1

        self.stdout.write(f'    + Создано {count} записей остатков')
