# Generated for Phase 3 — Category.source_id required by official catalogue sync

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0012_official_catalogue_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='source_id',
            field=models.CharField(
                blank=True,
                help_text='Stable id from the official catalogue manifest.',
                max_length=64,
                null=True,
                unique=True,
            ),
        ),
    ]
