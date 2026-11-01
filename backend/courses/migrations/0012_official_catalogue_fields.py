# Generated manually for Phase 3 official catalogue sync

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0011_course_learning_outcomes'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='category',
            name='display_order',
            field=models.PositiveIntegerField(default=100),
        ),
        migrations.AddField(
            model_name='category',
            name='is_official',
            field=models.BooleanField(
                default=False,
                help_text='True for categories from the official CAITECH catalogue taxonomy.',
            ),
        ),
        migrations.AlterModelOptions(
            name='category',
            options={
                'ordering': ['display_order', 'name', 'pk'],
                'verbose_name_plural': 'Categories',
            },
        ),
        migrations.AddField(
            model_name='course',
            name='source_id',
            field=models.CharField(
                blank=True,
                db_index=True,
                help_text='Stable official catalogue identifier (e.g. mep-01). Null for non-official rows.',
                max_length=64,
                null=True,
                unique=True,
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='is_official',
            field=models.BooleanField(
                default=False,
                help_text='True when this course is owned by the official catalogue sync.',
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='target_audience',
            field=models.TextField(
                blank=True,
                default='',
                help_text='Official target audience / best-for text from the corporate catalogue.',
            ),
        ),
    ]
