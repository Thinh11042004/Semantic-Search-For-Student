# AI Service for Semantic Search

This service provides semantic search capabilities for student forms using FastAPI and PostgreSQL with pgvector.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   PORT=8000
   DB_HOST=localhost
   DB_NAME=semantic_search
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_PORT=5432
   ```

3. Make sure PostgreSQL with pgvector extension is running:
   ```bash
   # Using Docker
   docker-compose up -d
   ```

## Running the Service

Start the FastAPI server:
```bash
python app.py
```

The API will be available at http://localhost:8000

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Importing Data

To import form data from a JSON file:
```bash
python import_data.py --file path/to/forms.json
```

The JSON file should contain an array of form objects with the following structure:
```json
[
  {
    "title": "Student Registration Form",
    "content": "Form for registering new students for the semester",
    "form_type": "Registration",
    "url": "/forms/registration"
  },
  ...
]
``` 