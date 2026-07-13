# Generated manually because local Django environment is not installed.

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("requests", "0005_remove_requestapproval_otp_code_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="assetrequest",
            name="issue_responsibles",
            field=models.ManyToManyField(
                blank=True,
                related_name="issue_responsible_requests",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Ответственные за выдачу",
            ),
        ),
        migrations.AlterField(
            model_name="assetrequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("DRAFT", "Черновик"),
                    ("SENT_FOR_REVISION", "На корректировке"),
                    ("PENDING_SUPERVISOR", "На согласовании у руководителя"),
                    ("APPROVED_SUPERVISOR", "Согласована руководителем"),
                    ("APPROVED_MOL", "Согласована МОЛ"),
                    ("APPROVED_AHS_HEAD", "Утверждена руководителем АХС"),
                    ("APPROVED", "Согласована"),
                    ("EXECUTED", "Выдана"),
                    ("REJECTED", "Отклонена"),
                    ("CANCELLED", "Отменена"),
                ],
                default="DRAFT",
                max_length=30,
                verbose_name="Статус",
            ),
        ),
        migrations.AlterField(
            model_name="requestapproval",
            name="action",
            field=models.CharField(
                choices=[
                    ("SUBMITTED", "Отправлено на согласование"),
                    ("APPROVED", "Согласовано"),
                    ("REJECTED", "Отклонено"),
                    ("SENT_TO_REVISION", "Отправлено на доработку"),
                    ("WITHDRAWN", "Отозвано инициатором"),
                ],
                max_length=20,
                verbose_name="Действие",
            ),
        ),
    ]
