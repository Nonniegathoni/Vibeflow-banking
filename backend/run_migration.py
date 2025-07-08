import os
import psycopg2
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

DB_NAME = "vibeflow"
DB_USER = "viber"
DB_PASSWORD = "hfFJ62NFDQrUG01CabZcKregE3L0HG72"
DB_HOST = "dpg-cvvurnd6ubrc73ak94rg-a.virginia-postgres.render.com"
DB_PORT = "5432"

def run_migration():
    conn = None
    try:
        print("🔄 Running migrations...")
        
        # Connect to the database
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()

        # Create migrations table if it doesn't exist
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
        except psycopg2.Error as e:
            print(f"Error creating migrations table: {e}")
            conn.rollback()
            return

        # Get list of migration files
        migration_files = sorted([f for f in os.listdir('migrations') if f.endswith('.sql')])
        
        for migration_file in migration_files:
            try:
                # Check if migration has already been run
                cur.execute("SELECT id FROM migrations WHERE name = %s", (migration_file,))
                if cur.fetchone():
                    print(f"Skipping {migration_file} - already executed")
                    continue

                print(f"Running migration: {migration_file}")
                
                # Read and execute migration file
                with open(f'migrations/{migration_file}', 'r') as f:
                    sql = f.read()
                    cur.execute(sql)
                
                # Record migration execution
                cur.execute("INSERT INTO migrations (name) VALUES (%s)", (migration_file,))
                
                conn.commit()
                print(f"Successfully executed {migration_file}")
            except psycopg2.Error as e:
                conn.rollback()  # Rollback the failed transaction
                if "already exists" in str(e):
                    print(f"Column already exists in {migration_file}, marking as executed")
                    try:
                        cur.execute("INSERT INTO migrations (name) VALUES (%s)", (migration_file,))
                        conn.commit()
                    except psycopg2.Error as insert_error:
                        conn.rollback()
                        print(f"Failed to mark migration as executed: {insert_error}")
                else:
                    print(f"Error executing migration {migration_file}: {e}")
                    continue

        print("All migrations completed successfully")

    except Exception as e:
        print(f"🔥 Error running migrations: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration() 