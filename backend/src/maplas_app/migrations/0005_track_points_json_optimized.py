# Generated by Django 2.2 on 2019-07-23 11:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0004_auto_20190713_0636'),
    ]

    operations = [
        migrations.AddField(
            model_name='track',
            name='points_json_optimized',
            field=models.TextField(default=[]),
            preserve_default=False,
        ),
    ]