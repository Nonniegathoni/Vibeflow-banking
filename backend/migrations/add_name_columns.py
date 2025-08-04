import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DB_NAME = "vibeflow"
DB_USER = "viber"
DB_PASSWORD = "hfFJ62NFDQrUG01CabZcKregE3L0HG72"
DB_HOST = "dpg-cvvurnd6ubrc73ak94rg-a.virginia-postgres.render.com"
DB_PORT = "5432"

def add_name_columns():
    conn = None
    cur = None
    try:
        print("🔄 Adding name, verification, and last_login columns to users table...")
        
        # Connect to the database
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()

        # Add first_name, last_name, verification, and last_login columns
        cur.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
            ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
            ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
        """)

        # Update existing records to split the name field
        cur.execute("""
            UPDATE users
            SET 
                first_name = SPLIT_PART(name, ' ', 1),
                last_name = CASE 
                    WHEN SPLIT_PART(name, ' ', 2) = '' THEN NULL
                    ELSE SPLIT_PART(name, ' ', 2)
                END
        """)

        # Commit the changes
        conn.commit()
        print("✅ All columns added successfully!")

    except Exception as e:
        print(f"🔥 Error adding columns: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    add_name_columns() 