# Generated by Django 4.2.16 on 2024-11-10 13:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="profile_info",
            field=models.TextField(blank=True),
        ),
    ]
