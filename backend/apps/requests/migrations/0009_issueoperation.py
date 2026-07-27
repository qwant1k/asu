from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0007_stockalertrule_stockalertstate_and_more'),
        ('references', '0008_contract'),
        ('requests', '0008_assetrequest_receipt_confirmed_at_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='IssueOperation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Количество')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата выдачи')),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='request_issue_operations', to='references.asset', verbose_name='Выданный актив')),
                ('movement', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, related_name='request_issue_operation', to='assets.stockmovement', verbose_name='Движение по складу')),
                ('performed_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='request_issue_operations', to=settings.AUTH_USER_MODEL, verbose_name='Выдал')),
                ('request_item', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='issue_operations', to='requests.assetrequestitem', verbose_name='Позиция заявки')),
                ('warehouse', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='request_issue_operations', to='references.warehouse', verbose_name='Склад')),
            ],
            options={
                'verbose_name': 'Операция выдачи по заявке',
                'verbose_name_plural': 'Операции выдачи по заявкам',
                'ordering': ['created_at', 'id'],
            },
        ),
        migrations.AddConstraint(
            model_name='issueoperation',
            constraint=models.CheckConstraint(check=models.Q(('quantity__gt', 0)), name='request_issue_quantity_positive'),
        ),
    ]
