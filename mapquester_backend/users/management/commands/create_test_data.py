from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from pois.models import POI, PoiInteractions
from users.models import Follow
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Creates test users with POIs and interactions"

    def handle(self, *args, **kwargs):
        # Create the main test user (Kanye)
        username = "kanyewest"
        email = "kanyewest@gmail.com"
        password = "kwest2028"

        User.objects.filter(username=username).delete()
        main_user = User.objects.create_user(
            username=username, email=email, password=password
        )
        self.stdout.write(self.style.SUCCESS(f"Created main test user: {username}"))

        # Create 100 POIs for the main user
        tags = ["food", "event", "school", "photo", "music"]
        for i in range(100):
            POI.objects.create(
                userId=main_user,
                latitude=Decimal(random.uniform(40.5, 40.9)),  # NYC
                longitude=Decimal(random.uniform(-74.1, -73.8)),
                isPublic=True,
                title=f"Test POI {i+1}",
                tag=random.choice(tags),
                description=f"This is a test POI number {i+1}",
                reactions=0,
            )

        # Create 7 additional users
        additional_users = []
        usernames = ["drake", "travis", "kendrick", "jayz", "eminem", "nas", "cole"]
        for username in usernames:
            user = User.objects.create_user(
                username=username,
                email=f"{username}@gmail.com",
                password="test2028",
                profile_info=f"Test profile for {username}",
            )
            additional_users.append(user)
            self.stdout.write(
                self.style.SUCCESS(f"Created additional user: {username}")
            )

        # Set up following relationships
        # First 5 users will be followed by main user
        for user in additional_users[:5]:
            Follow.objects.create(follower=main_user, following=user)
            self.stdout.write(
                self.style.SUCCESS(f"{main_user.username} now follows {user.username}")
            )

        # Last 2 users will follow main user
        for user in additional_users[5:]:
            Follow.objects.create(follower=user, following=main_user)
            self.stdout.write(
                self.style.SUCCESS(f"{user.username} now follows {main_user.username}")
            )

        # Create POIs for additional users
        for user in additional_users:
            for i in range(25):
                POI.objects.create(
                    userId=user,
                    latitude=Decimal(random.uniform(40.5, 40.9)),  # NYC
                    longitude=Decimal(random.uniform(-74.1, -73.8)),
                    isPublic=True,
                    title=f"{user.username}'s POI {i+1}",
                    tag=random.choice(tags),
                    description=f"This is {user.username}'s POI number {i+1}",
                    reactions=random.randint(0, 10),
                )

        # Create interactions from followers to main user's POIs
        main_user_pois = POI.objects.filter(userId=main_user)
        interaction_types = ["reaction", "comment"]
        comment_texts = [
            "Great spot!",
            "Love this place!",
            "Must visit!",
            "Amazing view!",
            "Thanks for sharing!",
        ]

        for follower in additional_users[5:]:  # Last 2 users who follow main user
            # Randomly interact with 30% of main user's POIs
            for poi in random.sample(
                list(main_user_pois), k=int(len(main_user_pois) * 0.3)
            ):
                interaction_type = random.choice(interaction_types)
                PoiInteractions.objects.create(
                    userId=follower,
                    poiId=poi,
                    interactionType=interaction_type,
                    content=(
                        random.choice(comment_texts)
                        if interaction_type == "comment"
                        else None
                    ),
                )
                if interaction_type == "reaction":
                    poi.reactions += 1
                    poi.save()

        self.stdout.write(self.style.SUCCESS("Successfully created all test data"))
