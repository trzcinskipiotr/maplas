# Generated by Django 2.2 on 2020-07-09 05:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0017_photo_org_filename'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='approved',
            field=models.BooleanField(default=True),
        ),
    ]
