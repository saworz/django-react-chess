# Generated by Django 4.2.5 on 2024-02-12 18:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_profile_loses_profile_wins'),
    ]

    operations = [
        migrations.RenameField(
            model_name='profile',
            old_name='loses',
            new_name='losses',
        ),
    ]
