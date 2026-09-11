import sqlite3
from datetime import datetime
from pathlib import Path


# ============================================================
# Database Configuration
# ============================================================

# Always use placement.db inside the backend folder where database.py exists.
# This prevents different parts of the Flask application from opening
# different SQLite databases because of a different current working directory.
DATABASE_NAME = str(Path(__file__).resolve().parent / "placement.db")


# ============================================================
# Database Connection
# ============================================================

def create_connection():
    return sqlite3.connect(DATABASE_NAME)


# ============================================================
# Create Tables
# ============================================================

def create_table():

    conn = create_connection()
    cursor = conn.cursor()

    # ==========================
    # Predictions Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        student_name TEXT,
        cgpa REAL,
        aptitude REAL,
        projects INTEGER,
        internship TEXT,
        communication REAL,

        probability INTEGER,
        status TEXT,
        status_label TEXT,

        generated_at TEXT

    )
    """)

    # ==========================
    # Users Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,

        college TEXT,
        degree TEXT,
        branch TEXT,
        year TEXT,

        created_at TEXT

    )
    """)

    # ==========================
    # Student Profile Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER UNIQUE,

        college TEXT,
        degree TEXT,
        branch TEXT,
        year TEXT,

        cgpa REAL,
        aptitude_score REAL,
        communication_score REAL,

        target_role TEXT,

        resume_path TEXT,

        profile_completion INTEGER DEFAULT 0,

        updated_at TEXT,

        phone TEXT,
        linkedin TEXT,
        github TEXT,
        address TEXT,

        FOREIGN KEY(user_id)
        REFERENCES users(id)

    )
    """)

    # ==========================
    # Projects Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        project_name TEXT,
        technologies TEXT,
        description TEXT,
        github_link TEXT,

        FOREIGN KEY(user_id)
        REFERENCES users(id)

    )
    """)

    # ==========================
    # Internship Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS internships (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        company_name TEXT,
        role TEXT,
        duration TEXT,
        mode TEXT,

        FOREIGN KEY(user_id)
        REFERENCES users(id)

    )
    """)

    # ==========================
    # Certification Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS certifications (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        certificate_name TEXT,
        organization TEXT,
        completion_date TEXT,

        FOREIGN KEY(user_id)
        REFERENCES users(id)

    )
    """)

    # ==========================
    # Skills Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS skills (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        skill_name TEXT,
        skill_type TEXT,
        proficiency TEXT,

        FOREIGN KEY(user_id)
        REFERENCES users(id)

    )
    """)

    conn.commit()
    conn.close()


# ============================================================
# Save Prediction
# ============================================================

def save_prediction(data, result):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO predictions (
        student_name,
        cgpa,
        aptitude,
        projects,
        internship,
        communication,
        probability,
        status,
        status_label,
        generated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("fullName"),
        data.get("cgpa"),
        data.get("aptitudeScore"),
        data.get("projects"),
        data.get("internship"),
        data.get("communication"),
        result.get("probability"),
        result.get("status"),
        result.get("statusLabel"),
        result.get("generatedAt")
    ))

    conn.commit()
    conn.close()


# ============================================================
# Get Prediction History
# ============================================================

def get_all_predictions():

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM predictions
    ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# ============================================================
# Create User
# ============================================================

def create_user(
    full_name,
    email,
    password,
    college,
    degree,
    branch,
    year
):

    conn = create_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
        INSERT INTO users (
            full_name,
            email,
            password,
            college,
            degree,
            branch,
            year,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            full_name,
            email,
            password,
            college,
            degree,
            branch,
            year,
            datetime.now().isoformat()
        ))

        conn.commit()
        return True

    except sqlite3.IntegrityError:
        return False

    finally:
        conn.close()


# ============================================================
# Get User By Email
# ============================================================

def get_user_by_email(email):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    user = cursor.fetchone()

    conn.close()

    if user:
        return dict(user)

    return None


# ============================================================
# Get Student Profile
# ============================================================

def get_student_profile(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        sp.*,
        u.full_name,
        u.email
    FROM student_profiles sp
    LEFT JOIN users u
        ON sp.user_id = u.id
    WHERE sp.user_id = ?
    """, (user_id,))

    profile = cursor.fetchone()

    conn.close()

    if profile:
        return dict(profile)

    return None


# ============================================================
# Save / Update Student Profile
# ============================================================

def save_student_profile(user_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id
    FROM student_profiles
    WHERE user_id = ?
    """, (user_id,))

    existing = cursor.fetchone()

    if existing:

        cursor.execute("""
        UPDATE student_profiles
        SET
            college = ?,
            degree = ?,
            branch = ?,
            year = ?,
            cgpa = ?,
            aptitude_score = ?,
            communication_score = ?,
            target_role = ?,
            phone = ?,
            linkedin = ?,
            github = ?,
            address = ?,
            updated_at = ?
        WHERE user_id = ?
        """, (
            data.get("college"),
            data.get("degree"),
            data.get("branch"),
            data.get("year"),
            data.get("cgpa"),
            data.get("aptitude_score"),
            data.get("communication_score"),
            data.get("target_role"),
            data.get("phone"),
            data.get("linkedin"),
            data.get("github"),
            data.get("address"),
            datetime.now().isoformat(),
            user_id
        ))

    else:

        cursor.execute("""
        INSERT INTO student_profiles (
            user_id,
            college,
            degree,
            branch,
            year,
            cgpa,
            aptitude_score,
            communication_score,
            target_role,
            phone,
            linkedin,
            github,
            address,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            data.get("college"),
            data.get("degree"),
            data.get("branch"),
            data.get("year"),
            data.get("cgpa"),
            data.get("aptitude_score"),
            data.get("communication_score"),
            data.get("target_role"),
            data.get("phone"),
            data.get("linkedin"),
            data.get("github"),
            data.get("address"),
            datetime.now().isoformat()
        ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Add Project
# ============================================================

def add_project(user_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO projects (
        user_id,
        project_name,
        technologies,
        description,
        github_link
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        data.get("project_name"),
        data.get("technologies"),
        data.get("description"),
        data.get("github_link")
    ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Get User Projects
# ============================================================

def get_projects(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM projects
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# ============================================================
# Delete Project
# ============================================================

def delete_project(project_id):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM projects WHERE id = ?",
        (project_id,)
    )

    conn.commit()
    conn.close()

    return True


# ============================================================
# Update Project
# ============================================================

def update_project(project_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    UPDATE projects
    SET
        project_name = ?,
        technologies = ?,
        description = ?,
        github_link = ?
    WHERE id = ?
    """, (
        data.get("project_name"),
        data.get("technologies"),
        data.get("description"),
        data.get("github_link"),
        project_id
    ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Add Skill
# ============================================================

def add_skill(user_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO skills (
        user_id,
        skill_name,
        skill_type,
        proficiency
    )
    VALUES (?, ?, ?, ?)
    """, (
        user_id,
        data.get("skill_name"),
        data.get("skill_type"),
        data.get("proficiency")
    ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Get Skills
# ============================================================

def get_skills(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM skills
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))

    skills = cursor.fetchall()

    conn.close()

    return [dict(skill) for skill in skills]


# ============================================================
# Delete Skill
# ============================================================

def delete_skill(skill_id):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM skills WHERE id = ?",
        (skill_id,)
    )

    conn.commit()
    conn.close()

    return True


# ============================================================
# Add Internship
# ============================================================

def add_internship(user_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO internships (
        user_id,
        company_name,
        role,
        duration,
        mode
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        user_id,
        data.get("company_name"),
        data.get("role"),
        data.get("duration"),
        data.get("mode")
    ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Get Internships
# ============================================================

def get_internships(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM internships
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))

    internships = cursor.fetchall()

    conn.close()

    return [dict(internship) for internship in internships]


# ============================================================
# Delete Internship
# ============================================================

def delete_internship(internship_id):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM internships WHERE id = ?",
        (internship_id,)
    )

    conn.commit()
    conn.close()

    return True


# ============================================================
# Add Certification
# ============================================================

def add_certification(user_id, data):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO certifications (
        user_id,
        certificate_name,
        organization,
        completion_date
    )
    VALUES (?, ?, ?, ?)
    """, (
        user_id,
        data.get("certificate_name"),
        data.get("organization"),
        data.get("completion_date")
    ))

    conn.commit()
    conn.close()

    return True


# ============================================================
# Get Certifications
# ============================================================

def get_certifications(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
    SELECT *
    FROM certifications
    WHERE user_id = ?
    ORDER BY id DESC
    """, (user_id,))

    certifications = cursor.fetchall()

    conn.close()

    return [dict(certification) for certification in certifications]


# ============================================================
# Delete Certification
# ============================================================

def delete_certification(certification_id):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM certifications WHERE id = ?",
        (certification_id,)
    )

    conn.commit()
    conn.close()

    return True


# ============================================================
# Dashboard Summary
# ============================================================

def get_dashboard_summary(user_id):

    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT COUNT(*) FROM projects WHERE user_id=?",
        (user_id,)
    )
    projects = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM skills WHERE user_id=?",
        (user_id,)
    )
    skills = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM internships WHERE user_id=?",
        (user_id,)
    )
    internships = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM certifications WHERE user_id=?",
        (user_id,)
    )
    certifications = cursor.fetchone()[0]

    conn.close()

    return {
        "projects": projects,
        "skills": skills,
        "internships": internships,
        "certifications": certifications,
        "profile_completion": calculate_profile_completion(user_id)
    }


# ============================================================
# Profile Completion
# ============================================================

def calculate_profile_completion(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        u.full_name,
        u.email,
        sp.phone,
        sp.college,
        sp.degree,
        sp.branch,
        sp.year,
        sp.cgpa
    FROM users u
    LEFT JOIN student_profiles sp
        ON u.id = sp.user_id
    WHERE u.id = ?
    """, (user_id,))

    profile = cursor.fetchone()

    if not profile:
        conn.close()
        return 0

    fields = [
        "full_name",
        "email",
        "phone",
        "college",
        "degree",
        "branch",
        "year",
        "cgpa"
    ]

    completed = sum(
        1 for field in fields
        if profile[field] is not None
        and str(profile[field]).strip() != ""
    )

    conn.close()

    return int((completed / len(fields)) * 100)


# ============================================================
# Resume Data
# ============================================================

def get_resume_data(user_id):

    conn = create_connection()
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    # --------------------------
    # Get User Details
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM users
    WHERE id = ?
    """, (user_id,))

    user = cursor.fetchone()

    # --------------------------
    # Get Student Profile
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM student_profiles
    WHERE user_id = ?
    """, (user_id,))

    profile = cursor.fetchone()

    # --------------------------
    # Get Projects
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM projects
    WHERE user_id = ?
    """, (user_id,))

    projects = cursor.fetchall()

    # --------------------------
    # Get Skills
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM skills
    WHERE user_id = ?
    """, (user_id,))

    skills = cursor.fetchall()

    # --------------------------
    # Get Internships
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM internships
    WHERE user_id = ?
    """, (user_id,))

    internships = cursor.fetchall()

    # --------------------------
    # Get Certifications
    # --------------------------

    cursor.execute("""
    SELECT *
    FROM certifications
    WHERE user_id = ?
    """, (user_id,))

    certifications = cursor.fetchall()

    conn.close()

    # --------------------------
    # Merge User + Profile
    # --------------------------

    profile_data = {}

    if user:
        profile_data.update(dict(user))

    if profile:
        profile_data.update(dict(profile))

    return {
        "profile": profile_data,
        "projects": [dict(project) for project in projects],
        "skills": [dict(skill) for skill in skills],
        "internships": [dict(internship) for internship in internships],
        "certifications": [dict(certification) for certification in certifications]
    }


# ============================================================
# Initialize Database
# ============================================================

# Safe because every CREATE TABLE statement uses IF NOT EXISTS.
create_table()
