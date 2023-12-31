# Generated by Django 4.2.5 on 2023-12-14 18:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chess', '0005_blackpieces_castled_blackpieces_king_moved_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blackpieces',
            name='castled',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='blackpieces',
            name='king_moved',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='blackpieces',
            name='rook_1_moved',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='blackpieces',
            name='rook_2_moved',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='whitepieces',
            name='castled',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='whitepieces',
            name='king_moved',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='whitepieces',
            name='rook_1_moved',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AlterField(
            model_name='whitepieces',
            name='rook_2_moved',
            field=models.BooleanField(default=False, null=True),
        ),
    ]
