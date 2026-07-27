from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('integrations', '0001_initial')]
    operations = [
        migrations.AlterField(
            model_name='synclog',
            name='status',
            field=models.CharField(
                choices=[
                    ('RUNNING', 'Выполняется'),
                    ('SUCCESS', 'Успешно'),
                    ('FAILED', 'Ошибка'),
                    ('SKIPPED', 'Не выполнено'),
                ],
                default='RUNNING',
                max_length=20,
                verbose_name='Статус',
            ),
        ),
    ]
