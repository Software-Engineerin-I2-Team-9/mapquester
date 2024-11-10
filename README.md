# mapquester
MapQuester is an innovative platform for creating and sharing personalized maps with custom points of interest (POIs). Designed to enhance local discovery and provide unparalleled map customization, MapQuester fills the gap left by traditional mapping tools.

## Installation

1. Clone the repository
2. Install dependencies
3. Run the server   

## Setup Database

4. Set up PostgreSQL database:
   a. Install PostgreSQL if not already installed
   b. Create a new database:
      ```
      createdb mapquester
      ```
   c. Create a new user:
      ```
      createuser -s mapquester_user
      ```
   d. Set a password for the new user:
      ```
      psql
      \password mapquester_user
      ```
   e. Grant privileges to the user:
      ```
      GRANT ALL PRIVILEGES ON DATABASE mapquester TO mapquester_user;
      ```

5. Configure database settings:
   a. Copy the `example.env` file to `.env`:
      ```
      cp example.env .env
      ```
   b. Update the `.env` file with your database settings:
      ```
      DB_NAME=mapquester
      DB_USER=mapquester_user
      DB_PASSWORD=your_secure_password
      DB_HOST=localhost
      DB_PORT=5432
      ```

6. Run database migrations:
   ```
   python manage.py migrate
   ```

## Docker
Note: in base directory
1. Start service
   ```
   docker-compose -f docker-compose.dev.yml up --build
   ```
2. Stop service
   ```
   docker-compose -f docker-compose.dev.yml down
   ```

## Code Quality and Testing

### Backend
```
# Install tools
pip install flake8 black

# Format code
black .

# Check code quality
flake8 .

# Run tests
python manage.py test
```

### Frontend
```
# Run linting
npm run lint

# Run tests
npm run test
```