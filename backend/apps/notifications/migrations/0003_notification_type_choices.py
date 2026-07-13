# Generated manually because local Django environment is not installed.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0002_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("REQUEST_STATUS", "Изменение статуса заявки"),
                    ("REQUEST_TO_APPROVE", "Заявка на согласование"),
                    ("REQUEST_TO_ISSUE", "Заявка на выдачу"),
                    ("DOCUMENT_TO_SIGN", "Документ на подписание"),
                    ("OVERDUE_TASK", "Просроченная задача"),
                    ("ASSET_EXPIRY", "Истечение срока актива"),
                    ("REMINDER", "Напоминание"),
                ],
                max_length=30,
                verbose_name="Тип уведомления",
            ),
        ),
    ]
