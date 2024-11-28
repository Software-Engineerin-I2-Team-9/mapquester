from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from pois.models import POI
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a test user with 100 POIs'

    def handle(self, *args, **kwargs):
        # create a test user
        username = 'kanyewest'
        email = 'kanyewest@gmail.com'
        password = 'kwest2028'

        User.objects.filter(username=username).delete()

        user = User.objects.create_user(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f'Created test user: {username}'))

        # create 100 POIs for the user
        tags =  ["food", "event", "school", "photo", "music"]
        for i in range(100):
            POI.objects.create(
                userId=user,
                latitude=Decimal(random.uniform(40.5, 40.9)),  # NYC
                longitude=Decimal(random.uniform(-74.1, -73.8)),
                isPublic=True,
                title=f'Test POI {i+1}',
                tag=random.choice(tags),
                description=f'This is a test POI number {i+1}',
                reactions=0
            )

        self.stdout.write(self.style.SUCCESS(f'Created 100 POIs for {username}'))
