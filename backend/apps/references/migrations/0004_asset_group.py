from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0003_requesttype_requires_long_term_use'),
    ]

    operations = [
        migrations.AddField(
            model_name='asset',
            name='group',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='grouped_assets',
                to='references.assetcategory',
                verbose_name='Группа',
            ),
        ),
    ]
