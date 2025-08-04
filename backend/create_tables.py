import psycopg2
import time
from psycopg2 import OperationalError

# Database connection parameters
DB_NAME = "vibeflow_b3jd"
DB_USER = "viber"
DB_PASSWORD = "1SnuIVB9PleqpJjQe3IrX5P4mztADQs8"
DB_HOST = "dpg-d1puu6c9c44c73924l00-a.oregon-postgres.render.com"
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
                connect_timeout=10,
                sslmode='require'
            )
            return conn
        except OperationalError as e:
            print(f"Connection attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                raise

def create_tables():
    try:
        print("🔄 Creating missing tables...")
        
        # Connect to the database with retry logic
        conn = get_connection()
        cur = conn.cursor()

        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                phone_number VARCHAR(20),
                role VARCHAR(20) DEFAULT 'user',
                account_number VARCHAR(20) UNIQUE,
                balance DECIMAL(15, 2) DEFAULT 5000.00,
                status VARCHAR(20) DEFAULT 'active',
                verification_code VARCHAR(6),
                verification_code_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            );
        """)
        print("✅ Created users table")

        # Ensure updated_at column exists in users table
        cur.execute("""
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        """)
        print("✅ Ensured updated_at column exists in users table")

        # Create transactions table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                recipient_id INTEGER REFERENCES users(id),
                type VARCHAR(20) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                description TEXT,
                reference VARCHAR(50),
                status VARCHAR(20) DEFAULT 'pending',
                reported BOOLEAN DEFAULT false,
                risk_score INTEGER,
                location VARCHAR(100),
                ip_address VARCHAR(45),
                device_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ Created transactions table")

        # Create fraud_alerts table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS fraud_alerts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                transaction_id INTEGER REFERENCES transactions(id),
                description TEXT,
                status VARCHAR(20) DEFAULT 'new',
                risk_score INTEGER,
                resolution TEXT,
                resolved_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            );
        """)
        print("✅ Created fraud_alerts table")

        # Create fraud_rules table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS fraud_rules (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                rule_type VARCHAR(50) NOT NULL,
                threshold DECIMAL(15, 2),
                is_active BOOLEAN DEFAULT true,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP
            );
        """)
        print("✅ Created fraud_rules table")

        # Create customer_support table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS customer_support (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'open',
                assigned_to INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            );
        """)
        print("✅ Created customer_support table")

        # Create notifications table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ Created notifications table")

        # Create audit_logs table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id INTEGER,
                details TEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✅ Created audit_logs table")

        # Commit changes
        conn.commit()
        print("✅ All tables created successfully!")

    except Exception as e:
        print(f"🔥 Error creating tables: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_tables() 