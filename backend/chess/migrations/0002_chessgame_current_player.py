# Generated by Django 4.2.5 on 2023-10-09 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chess', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chessgame',
            name='current_player',
            field=models.CharField(default='white', max_length=5),
        ),
    ]