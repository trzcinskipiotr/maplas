# Generated by Django 2.2 on 2020-04-13 10:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0012_auto_20200413_1208'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlaceType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AlterField(
            model_name='region',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.CreateModel(
            name='Place',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lat', models.FloatField()),
                ('lon', models.FloatField()),
                ('name', models.CharField(blank=True, default='', max_length=2000)),
                ('description', models.CharField(blank=True, default='', max_length=2000)),
                ('type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='maplas_app.PlaceType')),
            ],
        ),
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, default='', max_length=2000)),
                ('description', models.CharField(blank=True, default='', max_length=2000)),
                ('place', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='maplas_app.Place')),
            ],
        ),
    ]