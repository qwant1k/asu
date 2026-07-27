from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [('assets', '0008_multiwarehouse_stock')]
    operations = [
        migrations.RemoveConstraint(
            model_name='stockmovement',
            name='stock_movement_quantity_positive',
        ),
    ]
