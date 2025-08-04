import psycopg2
import time
from psycopg2 import OperationalError

# Database connection parameters
DB_NAME = "vibeflow"
DB_USER = "viber"
DB_PASSWORD = "hfFJ62NFDQrUG01CabZcKregE3L0HG72"
DB_HOST = "dpg-cvvurnd6ubrc73ak94rg-a.virginia-postgres.render.com"
DB_PORT = "5432"

def get_connection(max_retries=3, retry_delay=5):
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                host=DB_HOST,
                port=DB_PORT,
                connect_timeout=10
            )
            return conn
        except OperationalError as e:
            print(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                raise

def add_updated_at_column():
    try:
        print("🔄 Adding updated_at column to customer_support table...")
        
        # Connect to the database with retry logic
        conn = get_connection()
        cur = conn.cursor()

        # Check if column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'customer_support' 
            AND column_name = 'updated_at'
        """)
        
        if not cur.fetchone():
            # Add updated_at column
            cur.execute("""
                ALTER TABLE customer_support 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """)
            
            # Update existing records to set updated_at = created_at
            cur.execute("""
                UPDATE customer_support 
                SET updated_at = created_at 
                WHERE updated_at IS NULL
            """)
            
            print("✅ Added updated_at column and updated existing records")
        else:
            print("✅ updated_at column already exists")

        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")

    except Exception as e:
        print(f"🔥 Error during migration: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    add_updated_at_column() 