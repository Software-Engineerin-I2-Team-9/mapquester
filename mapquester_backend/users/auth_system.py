from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.tokens import default_token_generator


class AuthSystem:
    def validate_credentials(self, username, password):
        # Validate user credentials
        pass

    def validate_token(self, token):
        # Validate user token
        pass

    def generate_token(self, user):
        return default_token_generator.make_token(user)

    def password_encryption(self, password):
        return make_password(password)
