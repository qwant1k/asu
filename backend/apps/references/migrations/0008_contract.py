from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('references', '0007_seed_unit_links'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contract',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('name', models.CharField(max_length=255, verbose_name='Наименование')),
                ('contract_date', models.DateField(verbose_name='Дата договора')),
                ('valid_until', models.DateField(verbose_name='Срок действия')),
                ('pdf_file', models.FileField(blank=True, null=True, upload_to='contracts/pdfs/', verbose_name='PDF договора')),
                ('counterparty', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contracts', to='references.counterparty', verbose_name='Контрагент')),
            ],
            options={
                'verbose_name': 'Договор',
                'verbose_name_plural': 'Договоры',
                'ordering': ['-contract_date', 'name'],
            },
        ),
    ]
