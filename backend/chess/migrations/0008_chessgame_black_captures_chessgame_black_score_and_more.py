# Generated by Django 4.2.5 on 2023-12-23 17:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chess', '0007_blackpieces_en_passant_field_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chessgame',
            name='black_captures',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='chessgame',
            name='black_score',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='chessgame',
            name='white_captures',
            field=models.JSONField(null=True),
        ),
        migrations.AddField(
            model_name='chessgame',
            name='white_score',
            field=models.IntegerField(default=0),
        ),
    ]
