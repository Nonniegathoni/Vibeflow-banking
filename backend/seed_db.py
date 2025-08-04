import os
import random
import string
import datetime
import bcrypt
import psycopg2
import time
from psycopg2 import OperationalError
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Load environment variables
load_dotenv()

DB_NAME = "vibeflow_b3jd"
DB_USER = "viber"
DB_PASSWORD = "1SnuIVB9PleqpJjQe3IrX5P4mztADQs8"
DB_HOST = "dpg-d1puu6c9c44c73924l00-a.oregon-postgres.render.com"
DB_PORT = "5432"
# Database connection parameters
# DB_NAME = os.getenv('DB_NAME')
# DB_USER = os.getenv('DB_USER')
# DB_PASSWORD = os.getenv('DB_PASSWORD')
# DB_HOST = os.getenv('DB_HOST')
# DB_PORT = os.getenv('DB_PORT', '5432')

# Kenyan names for realistic data
KENYAN_NAMES = [
    "Wanjiku Kamau",
    "Otieno Odhiambo",
    "Njeri Mwangi",
    "Kipchoge Keino",
    "Akinyi Onyango",
    "Muthoni Kariuki",
    "Omondi Ochieng",
    "Wangari Maathai",
    "Kimani Nganga",
    "Auma Obama",
    "Jomo Kenyatta",
    "Lupita Nyong'o",
    "Eliud Kipchoge",
    "Wangui Ngũgĩ",
    "Meja Mwangi",
]

# Transaction types
TRANSACTION_TYPES = ["deposit", "withdrawal", "transfer", "payment", "mpesa_deposit", "mpesa_withdrawal"]

# Transaction descriptions
TRANSACTION_DESCRIPTIONS = {
    "deposit": ["Cash Deposit", "Salary Deposit", "Cheque Deposit", "Business Income"],
    "withdrawal": ["ATM Withdrawal", "Over-the-counter Withdrawal", "Agent Withdrawal"],
    "transfer": ["Account Transfer", "Family Support", "Business Payment", "Loan Repayment"],
    "payment": ["Utility Payment", "School Fees", "Rent Payment", "Grocery Shopping", "Medical Bill"],
    "mpesa_deposit": ["M-PESA Deposit", "M-PESA Transfer In", "Mobile Money Deposit"],
    "mpesa_withdrawal": ["M-PESA Withdrawal", "M-PESA Transfer Out", "Mobile Money Withdrawal"],
}

# Kenyan locations
LOCATIONS = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Machakos",
    "Garissa",
]

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

def generate_account_number() -> str:
    return str(random.randint(1000000000, 9999999999))

def generate_phone_number() -> str:
    return f"+254{random.randint(700000000, 799999999)}"

def generate_reference() -> str:
    timestamp = str(int(datetime.datetime.now().timestamp()))[-8:]
    random_num = str(random.randint(0, 999)).zfill(3)
    return f"VF{timestamp}{random_num}"

def generate_ip_address() -> str:
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"

def generate_device_info() -> str:
    devices = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    ]
    return random.choice(devices)

def generate_date(days_ago: int = 365) -> datetime.datetime:
    return datetime.datetime.now() - datetime.timedelta(days=random.randint(1, days_ago))

def calculate_risk_score(amount: float, type: str) -> int:
    score = 0

    # Higher amounts have higher risk
    if amount > 50000:
        score += 30
    elif amount > 10000:
        score += 15
    elif amount > 5000:
        score += 5

    # Certain transaction types are riskier
    if type in ["withdrawal", "mpesa_withdrawal"]:
        score += 10
    if type == "transfer":
        score += 5

    # Add some randomness
    score += random.randint(0, 20)

    # Cap at 100
    return min(score, 100)

def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=6))


def seed_database():
    try:
        print("🔄 Seeding database with test data...")
        # Add your database seeding logic here
    except Exception as e:
        print(f"❌ Error while seeding: {e}")

import os
import random
import string
import datetime
import bcrypt
import psycopg2
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Load environment variables
load_dotenv()

DB_NAME = "vibeflow_b3jd"
DB_USER = "viber"
DB_PASSWORD = "1SnuIVB9PleqpJjQe3IrX5P4mztADQs8"
DB_HOST = "dpg-d1puu6c9c44c73924l00-a.oregon-postgres.render.com"
DB_PORT = "5432"
# Database connection parameters
# DB_NAME = os.getenv('DB_NAME')
# DB_USER = os.getenv('DB_USER')
# DB_PASSWORD = os.getenv('DB_PASSWORD')
# DB_HOST = os.getenv('DB_HOST')
# DB_PORT = os.getenv('DB_PORT', '5432')

# Kenyan names for realistic data
KENYAN_NAMES = [
    "Wanjiku Kamau",
    "Otieno Odhiambo",
    "Njeri Mwangi",
    "Kipchoge Keino",
    "Akinyi Onyango",
    "Muthoni Kariuki",
    "Omondi Ochieng",
    "Wangari Maathai",
    "Kimani Nganga",
    "Auma Obama",
    "Jomo Kenyatta",
    "Lupita Nyong'o",
    "Eliud Kipchoge",
    "Wangui Ngũgĩ",
    "Meja Mwangi",
]

# Transaction types
TRANSACTION_TYPES = ["deposit", "withdrawal", "transfer", "payment", "mpesa_deposit", "mpesa_withdrawal"]

# Transaction descriptions
TRANSACTION_DESCRIPTIONS = {
    "deposit": ["Cash Deposit", "Salary Deposit", "Cheque Deposit", "Business Income"],
    "withdrawal": ["ATM Withdrawal", "Over-the-counter Withdrawal", "Agent Withdrawal"],
    "transfer": ["Account Transfer", "Family Support", "Business Payment", "Loan Repayment"],
    "payment": ["Utility Payment", "School Fees", "Rent Payment", "Grocery Shopping", "Medical Bill"],
    "mpesa_deposit": ["M-PESA Deposit", "M-PESA Transfer In", "Mobile Money Deposit"],
    "mpesa_withdrawal": ["M-PESA Withdrawal", "M-PESA Transfer Out", "Mobile Money Withdrawal"],
}

# Kenyan locations
LOCATIONS = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Machakos",
    "Garissa",
]

def generate_account_number() -> str:
    return str(random.randint(1000000000, 9999999999))

def generate_phone_number() -> str:
    return f"+254{random.randint(700000000, 799999999)}"

def generate_reference() -> str:
    timestamp = str(int(datetime.datetime.now().timestamp()))[-8:]
    random_num = str(random.randint(0, 999)).zfill(3)
    return f"VF{timestamp}{random_num}"

def generate_ip_address() -> str:
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"

def generate_device_info() -> str:
    devices = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
    ]
    return random.choice(devices)

def generate_date(days_ago: int = 365) -> datetime.datetime:
    return datetime.datetime.now() - datetime.timedelta(days=random.randint(1, days_ago))

def calculate_risk_score(amount: float, type: str) -> int:
    score = 0

    # Higher amounts have higher risk
    if amount > 50000:
        score += 30
    elif amount > 10000:
        score += 15
    elif amount > 5000:
        score += 5

    # Certain transaction types are riskier
    if type in ["withdrawal", "mpesa_withdrawal"]:
        score += 10
    if type == "transfer":
        score += 5

    # Add some randomness
    score += random.randint(0, 20)

    # Cap at 100
    return min(score, 100)

def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def seed_database():
    try:
        print("🔄 Seeding database with test data...")

        # Connect to the database
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cur = conn.cursor()

        # Create test users
        print("Creating test users...")
        users = []
        for i, name in enumerate(KENYAN_NAMES):
            first_name = name.split()[0]
            last_name = ' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
            email = f"{first_name.lower()}@example.com"
            
            # Check if user already exists
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cur.fetchone()
            
            if existing_user:
                print(f"User {email} already exists, updating name and verification code...")
                verification_code = generate_verification_code()
                verification_code_expires_at = datetime.datetime.now() + datetime.timedelta(hours=24)
                cur.execute(
                    """
                    UPDATE users 
                    SET name = %s, first_name = %s, last_name = %s,
                    verification_code = %s, verification_code_expires_at = %s
                    WHERE email = %s
                    RETURNING id
                    """,
                    (name, first_name, last_name, verification_code, verification_code_expires_at, email)
                )
                user_id = cur.fetchone()[0]
            else:
                password = bcrypt.hashpw("Password123".encode(), bcrypt.gensalt()).decode()
                role = "admin" if i == 0 else "agent" if i == 1 else "user"
                balance = random.randint(5000, 100000)
                account_number = generate_account_number()
                phone_number = generate_phone_number()
                created_at = generate_date()
                verification_code = generate_verification_code()
                verification_code_expires_at = datetime.datetime.now() + datetime.timedelta(hours=24)

                cur.execute(
                    """
                    INSERT INTO users 
                    (name, first_name, last_name, email, password, role, balance, account_number, phone_number, 
                    verification_code, verification_code_expires_at, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (name, first_name, last_name, email, password, role, balance, account_number, phone_number,
                    verification_code, verification_code_expires_at, created_at)
                )
                user_id = cur.fetchone()[0]

            users.append({
                "id": user_id,
                "name": name,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "role": role if not existing_user else None,  # Will fetch actual role later
                "balance": balance if not existing_user else None,  # Will fetch actual balance later
                "account_number": account_number if not existing_user else None  # Will fetch actual account number later
            })
            print(f"{'Updated' if existing_user else 'Created'} user: {name} ({email})")

        # Update verification codes for all users
        print("Updating verification codes for all users...")
        cur.execute("SELECT id, email FROM users")
        all_users = cur.fetchall()
        
        for user_id, email in all_users:
            verification_code = generate_verification_code()
            verification_code_expires_at = datetime.datetime.now() + datetime.timedelta(hours=24)
            cur.execute(
                """
                UPDATE users 
                SET verification_code = %s, verification_code_expires_at = %s
                WHERE id = %s
                """,
                (verification_code, verification_code_expires_at, user_id)
            )
            print(f"Updated verification code for user: {email}")

        # Fetch complete user data for existing users
        print("Fetching complete user data...")
        for user in users:
            if user["role"] is None:  # This means it was an existing user
                cur.execute(
                    "SELECT role, balance, account_number FROM users WHERE id = %s",
                    (user["id"],)
                )
                role, balance, account_number = cur.fetchone()
                user.update({
                    "role": role,
                    "balance": balance,
                    "account_number": account_number
                })

        # Create transactions
        print("Creating transactions...")
        transactions = []
        for _ in range(200):
            user = random.choice(users)
            type = random.choice(TRANSACTION_TYPES)
            amount = random.randint(100, 50000)
            description = random.choice(TRANSACTION_DESCRIPTIONS[type])
            reference = generate_reference()
            created_at = generate_date(30)
            risk_score = calculate_risk_score(amount, type)
            status = "flagged" if risk_score > 75 else "failed" if random.random() < 0.05 else "completed"
            reported = risk_score > 85 or random.random() < 0.03

            # Check if transaction with this reference already exists
            cur.execute("SELECT id FROM transactions WHERE reference = %s", (reference,))
            if cur.fetchone():
                print(f"Transaction with reference {reference} already exists, skipping...")
                continue

            # Determine recipient for transfers
            recipient_id = None
            if type == "transfer":
                recipient = random.choice([u for u in users if u["id"] != user["id"]])
                recipient_id = recipient["id"]

            cur.execute(
                """
                INSERT INTO transactions
                (user_id, recipient_id, type, amount, description, reference, status, reported, risk_score, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (user["id"], recipient_id, type, amount, description, reference, status, reported, risk_score, created_at)
            )
            transaction_id = cur.fetchone()[0]
            transactions.append({
                "id": transaction_id,
                "user_id": user["id"],
                "recipient_id": recipient_id,
                "type": type,
                "amount": amount,
                "status": status,
                "risk_score": risk_score
            })

        print(f"Created {len(transactions)} transactions")

        # Create fraud alerts
        print("Creating fraud alerts...")
        fraud_alerts = []
        for transaction in transactions:
            if transaction["risk_score"] > 75 or random.random() < 0.05:
                status = random.choices(["new", "reviewing", "resolved"], weights=[0.7, 0.15, 0.15])[0]
                description = f"Suspicious {transaction['type']} of KSH {transaction['amount']:.2f}"

                # Check if fraud alert for this transaction already exists
                cur.execute("SELECT id FROM fraud_alerts WHERE transaction_id = %s", (transaction["id"],))
                if cur.fetchone():
                    print(f"Fraud alert for transaction {transaction['id']} already exists, skipping...")
                    continue

                resolution = None
                if status == "resolved":
                    resolution = random.choice([
                        "Legitimate transaction confirmed with customer",
                        "Fraudulent transaction, account credited"
                    ])

                cur.execute(
                    """
                    INSERT INTO fraud_alerts
                    (user_id, transaction_id, description, status, risk_score, resolution, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (transaction["user_id"], transaction["id"], description, status, transaction["risk_score"], resolution, generate_date(15))
                )
                alert_id = cur.fetchone()[0]
                fraud_alerts.append({
                    "id": alert_id,
                    "transaction_id": transaction["id"],
                    "status": status
                })

        print(f"Created {len(fraud_alerts)} fraud alerts")

        # Create fraud rules
        print("Creating fraud rules...")
        fraud_rules = [
            {
                "name": "Large Transaction Amount",
                "description": "Flag transactions above a certain amount",
                "rule_type": "amount",
                "threshold": 50000,
            },
            {
                "name": "Multiple Transactions",
                "description": "Flag if user makes more than 5 transactions in an hour",
                "rule_type": "frequency",
                "threshold": 5,
            },
            {
                "name": "International Transactions",
                "description": "Flag transactions from outside Kenya",
                "rule_type": "location",
                "threshold": None,
            },
            {
                "name": "New Account Large Withdrawal",
                "description": "Flag large withdrawals from new accounts",
                "rule_type": "new_account",
                "threshold": 10000,
            },
            {
                "name": "Unusual Location",
                "description": "Flag transactions from locations user has not used before",
                "rule_type": "unusual_location",
                "threshold": None,
            },
        ]

        admin_user = next((u for u in users if u["role"] == "admin"), None)

        for rule in fraud_rules:
            # Check if rule already exists
            cur.execute("SELECT id FROM fraud_rules WHERE name = %s", (rule["name"],))
            if cur.fetchone():
                print(f"Fraud rule '{rule['name']}' already exists, skipping...")
                continue

            cur.execute(
                """
                INSERT INTO fraud_rules
                (name, description, rule_type, threshold, is_active, created_by, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (rule["name"], rule["description"], rule["rule_type"], rule["threshold"], True, admin_user["id"] if admin_user else None, generate_date(60))
            )

        print(f"Created fraud rules")

        # Create customer support tickets
        print("Creating customer support tickets...")
        support_subjects = [
            "Unable to complete transaction",
            "Suspicious activity on my account",
            "Need to update personal information",
            "Question about transaction fees",
            "Problem with mobile app",
            "Disputed transaction",
            "Account access issues",
        ]

        support_messages = [
            "I tried to make a payment but it failed multiple times. Can you help?",
            "I noticed a transaction I did not authorize. Please help me secure my account.",
            "I need to update my phone number and email address. What is the process?",
            "Could you explain the fee structure for international transfers?",
            "The mobile app keeps crashing when I try to view my transaction history.",
            "I want to dispute a transaction made on [date]. I did not authorize it.",
            "I cannot log into my account. It says my password is incorrect but I am sure it is right.",
        ]

        for _ in range(15):
            user = random.choice([u for u in users if u["role"] == "user"])
            subject_index = random.randint(0, len(support_subjects) - 1)
            status = random.choices(["open", "in_progress", "resolved"], weights=[0.6, 0.2, 0.2])[0]

            assigned_to = None
            if status != "open":
                support_staff = [u for u in users if u["role"] in ["admin", "agent"]]
                if support_staff:
                    assigned_to = random.choice(support_staff)["id"]

            cur.execute(
                """
                INSERT INTO customer_support
                (user_id, subject, message, status, assigned_to, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user["id"], support_subjects[subject_index], support_messages[subject_index], status, assigned_to, generate_date(20))
            )

        print("Created customer support tickets")

        # Create notifications
        print("Creating notifications...")
        notification_types = ["transaction", "security", "account", "support"]
        notification_titles = {
            "transaction": ["Transaction Completed", "Large Transaction Alert", "Transaction Failed"],
            "security": ["Security Alert", "New Device Login", "Password Changed"],
            "account": ["Account Update", "Balance Low", "Statement Available"],
            "support": ["Ticket Updated", "Support Response", "Issue Resolved"],
        }

        notification_messages = {
            "transaction": [
                "Your transaction of KSH [amount] has been completed successfully.",
                "A large transaction of KSH [amount] was processed on your account.",
                "Your transaction of KSH [amount] failed. Please try again.",
            ],
            "security": [
                "Unusual login activity detected on your account. Please verify.",
                "New device login detected. If this was not you, please contact support.",
                "Your password was changed successfully.",
            ],
            "account": [
                "Your account details have been updated successfully.",
                "Your account balance is below KSH 1,000. Consider making a deposit.",
                "Your monthly statement is now available for download.",
            ],
            "support": [
                "Your support ticket has been updated. Check for details.",
                "Support team has responded to your inquiry.",
                "Your support issue has been resolved. Please let us know if you need further assistance.",
            ],
        }

        for user in users:
            # Create 3-7 notifications per user
            notification_count = random.randint(3, 7)
            for _ in range(notification_count):
                type = random.choice(notification_types)
                titles = notification_titles[type]
                messages = notification_messages[type]
                title_index = random.randint(0, len(titles) - 1)
                message = messages[title_index]

                # Replace [amount] placeholder with random amount
                if "[amount]" in message:
                    amount = f"{random.randint(1000, 50000):.2f}"
                    message = message.replace("[amount]", amount)

                is_read = random.random() < 0.7

                cur.execute(
                    """
                    INSERT INTO notifications
                    (user_id, title, message, type, is_read, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (user["id"], titles[title_index], message, type, is_read, generate_date(10))
                )

        print("Created notifications for all users")

        # Create audit logs
        print("Creating audit logs...")
        audit_actions = [
            "user.login",
            "user.logout",
            "user.password_change",
            "user.profile_update",
            "transaction.create",
            "transaction.approve",
            "transaction.reject",
            "fraud.alert.create",
            "fraud.alert.resolve",
            "fraud.rule.create",
            "fraud.rule.update",
            "admin.login",
            "admin.user_update",
            "admin.system_setting_change",
        ]

        for _ in range(100):
            user = random.choice(users)
            action = random.choice(audit_actions)

            entity_type = None
            entity_id = None
            details = None

            if action == "user.login":
                entity_type = "user"
                entity_id = user["id"]
                details = f"User logged in from {random.choice(LOCATIONS)}"
            elif action == "user.logout":
                entity_type = "user"
                entity_id = user["id"]
                details = "User logged out"
            elif action == "user.password_change":
                entity_type = "user"
                entity_id = user["id"]
                details = "User changed password"
            elif action == "user.profile_update":
                entity_type = "user"
                entity_id = user["id"]
                details = "User updated profile information"
            elif action in ["transaction.create", "transaction.approve", "transaction.reject"]:
                entity_type = "transaction"
                entity_id = random.choice(transactions)["id"]
                details = "Transaction created" if action == "transaction.create" else "Transaction approved after review" if action == "transaction.approve" else "Transaction rejected"
            elif action in ["fraud.alert.create", "fraud.alert.resolve"]:
                entity_type = "fraud_alert"
                entity_id = random.choice(fraud_alerts)["id"] if fraud_alerts else None
                details = "Fraud alert created" if action == "fraud.alert.create" else "Fraud alert resolved"
            elif action in ["fraud.rule.create", "fraud.rule.update"]:
                entity_type = "fraud_rule"
                entity_id = 1  # Hardcoding to 1 as in TypeScript version
                details = "Fraud rule created" if action == "fraud.rule.create" else "Fraud rule updated"
            elif action == "admin.login":
                entity_type = "admin"
                entity_id = user["id"]
                details = f"Admin logged in from {random.choice(LOCATIONS)}"
            elif action == "admin.user_update":
                entity_type = "admin"
                entity_id = user["id"]
                details = "Admin updated user information"
            elif action == "admin.system_setting_change":
                entity_type = "admin"
                entity_id = user["id"]
                details = "Admin changed system settings"

            cur.execute(
                """
                INSERT INTO audit_logs
                (user_id, action, entity_type, entity_id, details, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (user["id"], action, entity_type, entity_id, details, generate_date(7))
            )

        print("Created audit logs")

        # Commit all changes
        conn.commit()
        print("✅ Database seeding completed successfully!")

    except Exception as e:
        print(f"🔥 Error seeding database: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    seed_database() 