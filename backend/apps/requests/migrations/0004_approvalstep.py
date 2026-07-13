from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('references', '0004_asset_group'),
        ('requests', '0003_request_item_group_and_issue_asset'),
    ]

    operations = [
        migrations.CreateModel(
            name='ApprovalStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField(default=1, verbose_name='Порядок')),
                ('approver_role', models.CharField(choices=[
                    ('ADMIN', 'Администратор'),
                    ('AHS_WORKER', 'Работник АХС'),
                    ('AHS_HEAD', 'Руководитель АХС'),
                    ('MOL_WAREHOUSE', 'МОЛ по складу'),
                    ('MOL_NMA', 'МОЛ по НМА'),
                    ('FO_HEAD', 'Руководитель ФО'),
                    ('DEPT_HEAD', 'Руководитель подразделения'),
                    ('USER', 'Рядовой пользователь'),
                    ('COMMISSION_MEMBER', 'Член Рабочей комиссии'),
                    ('IRD_WORKER', 'ИРД/ОСМР работник'),
                ], max_length=30, verbose_name='Роль согласующего')),
                ('title', models.CharField(blank=True, default='', max_length=255, verbose_name='Наименование этапа')),
                ('requires_supervisor', models.BooleanField(default=False, help_text='Актуально для роли «Руководитель подразделения»', verbose_name='Только непосредственный руководитель инициатора')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активен')),
                ('request_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='approval_steps', to='references.requesttype', verbose_name='Вид заявки')),
            ],
            options={
                'verbose_name': 'Этап согласования',
                'verbose_name_plural': 'Этапы согласования',
                'ordering': ['request_type', 'order'],
                'unique_together': {('request_type', 'order')},
            },
        ),
    ]
