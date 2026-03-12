from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('references', '0004_asset_group'),
        ('requests', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='assetrequestitem',
            name='issued_asset',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='issued_request_items',
                to='references.asset',
                verbose_name='Выданный актив',
            ),
        ),
        migrations.AddField(
            model_name='assetrequestitem',
            name='requested_group',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='request_items',
                to='references.assetcategory',
                verbose_name='Запрошенная группа',
            ),
        ),
        migrations.AlterField(
            model_name='assetrequestitem',
            name='asset',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='request_items',
                to='references.asset',
                verbose_name='Актив',
            ),
        ),
    ]
