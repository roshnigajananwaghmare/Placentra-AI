from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from database import create_connection
from datetime import datetime


def register_user(data):

    conn = create_connection()
    cursor = conn.cursor()

    # ==========================
    # Get Form Data
    # ==========================

    full_name = data.get("fullName", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    college = data.get("college", "").strip()   # Optional
    branch = data.get("branch", "").strip()
    year = data.get("year", "").strip()
    degree = data.get("degree", "").strip()
    # ==========================
    # Validation
    # ==========================

    if not full_name:
        conn.close()
        return {
            "success": False,
            "message": "Full Name is required."
        }

    if not email:
        conn.close()
        return {
            "success": False,
            "message": "Email is required."
        }

    if not password:
        conn.close()
        return {
            "success": False,
            "message": "Password is required."
        }

    if not branch:
        conn.close()
        return {
            "success": False,
            "message": "Branch is required."
        }

    if not year:
        conn.close()
        return {
            "success": False,
            "message": "Year is required."
        }

    # ==========================
    # Check Existing Email
    # ==========================

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:
        conn.close()
        return {
            "success": False,
            "message": "Email already exists."
        }

    # ==========================
    # Hash Password
    # ==========================

    hashed_password = generate_password_hash(password)

    # ==========================
    # Insert User
    # ==========================

    cursor.execute("""
        INSERT INTO users(

full_name,
email,
password,
college,
degree,
branch,
year,
created_at

)

        VALUES (?,?, ?, ?, ?, ?, ?, ?)
    """, (

        (
full_name,
email,
hashed_password,
college,
degree,
branch,
year,
datetime.now().isoformat()
)
    ))

    conn.commit()
    conn.close()

    # ==========================
    # Success Response
    # ==========================

    return {
        "success": True,
        "message": "Account created successfully."
    }
def login_user(data):

    conn = create_connection()
    cursor = conn.cursor()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        conn.close()
        return {
            "success": False,
            "message": "Email and Password are required."
        }

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    user = cursor.fetchone()

    if not user:
        conn.close()
        return {
            "success": False,
            "message": "User not found."
        }

    stored_password = user[3]

    if not check_password_hash(stored_password, password):
        conn.close()
        return {
            "success": False,
            "message": "Incorrect password."
        }

    conn.close()

    return {
        "success": True,
        "message": "Login Successful",
        "user": {
            "id": user[0],
            "fullName": user[1],
            "email": user[2],
            "college": user[4],
            "degree": user[5],
            "branch": user[6],
            "year": user[7]
        }
    }