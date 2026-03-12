from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='requesttype',
            name='requires_long_term_use',
            field=models.BooleanField(
                default=False,
                help_text='Применяется для номенклатуры/TMZ.',
                verbose_name='Только длительного пользования',
            ),
        ),
    ]
