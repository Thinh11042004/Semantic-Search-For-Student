import os
import json
import argparse
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_db():
    """Connect to PostgreSQL database"""
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "semantic_search"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        port=os.getenv("DB_PORT", "5432")
    )
    return conn

def create_tables(conn):
    """Create necessary tables if they don't exist"""
    with conn.cursor() as cur:
        # Create forms table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS forms (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            form_type TEXT NOT NULL,
            url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Create vector extension if not exists
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # Create forms_embedding table with vector column
        cur.execute("""
        CREATE TABLE IF NOT EXISTS forms_embedding (
            id SERIAL PRIMARY KEY,
            form_id INTEGER REFERENCES forms(id),
            embedding vector(1536),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        conn.commit()

def import_forms_from_json(file_path: str, conn) -> List[int]:
    """Import forms from a JSON file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        forms_data = json.load(f)
    
    if not isinstance(forms_data, list):
        raise ValueError("JSON file should contain a list of forms")
    
    form_ids = []
    with conn.cursor() as cur:
        for form in forms_data:
            cur.execute(
                """
                INSERT INTO forms (title, content, form_type, url)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (form['title'], form['content'], form['form_type'], form.get('url'))
            )
            form_id = cur.fetchone()[0]
            form_ids.append(form_id)
        
        conn.commit()
    
    return form_ids

def main():
    parser = argparse.ArgumentParser(description='Import form data into the database')
    parser.add_argument('--file', type=str, required=True, help='Path to JSON file containing form data')
    args = parser.parse_args()
    
    conn = connect_to_db()
    try:
        create_tables(conn)
        form_ids = import_forms_from_json(args.file, conn)
        print(f"Successfully imported {len(form_ids)} forms")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main() 