# Generated by Django 3.2.3 on 2024-10-16 03:51

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="POI",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("category", models.CharField(max_length=100)),
                ("coordinates", models.CharField(max_length=50)),
                (
                    "attachments",
                    models.FileField(blank=True, null=True, upload_to="attachments/"),
                ),
            ],
        ),
        migrations.CreateModel(
            name="PoiManager",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
            ],
        ),
    ]
