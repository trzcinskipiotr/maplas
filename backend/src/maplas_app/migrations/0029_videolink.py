# Generated by Django 2.2 on 2022-11-08 07:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maplas_app', '0028_auto_20221107_1048'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoLink',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=1000)),
                ('description', models.TextField(blank=True, default='')),
                ('link', models.CharField(blank=True, default='', max_length=1000)),
                ('html', models.TextField()),
                ('place', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='maplas_app.Place')),
                ('track', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='maplas_app.Track')),
            ],
        ),
    ]
