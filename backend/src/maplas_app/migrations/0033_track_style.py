# Generated by Django 2.2 on 2024-09-15 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0032_auto_20240914_1138'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='style',
            field=models.IntegerField(default=1),
        ),
    ]