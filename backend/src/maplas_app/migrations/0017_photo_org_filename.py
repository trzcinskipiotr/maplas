# Generated by Django 2.2 on 2020-06-17 12:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0016_photo_exif_time_taken'),
    ]

    operations = [
        migrations.AddField(
            model_name='photo',
            name='org_filename',
            field=models.CharField(blank=True, max_length=256, null=True),
        ),
    ]
