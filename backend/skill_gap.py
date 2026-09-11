from database import create_connection
from career_requirements import career_requirements


def analyze_skill_gap(user_id):

    conn = create_connection()
    conn.row_factory = lambda cursor, row: row[0]

    cursor = conn.cursor()

    # ==========================================
    # Get student's target role
    # ==========================================

    cursor.execute(
        """
        SELECT target_role
        FROM student_profiles
        WHERE user_id = ?
        """,
        (user_id,)
    )

    career = cursor.fetchone()

    # No target role selected
    if not career:
        conn.close()

        return {
            "career": "Not Selected",
            "your_skills": [],
            "required_skills": [],
            "matched_skills": [],
            "missing_skills": [],
            "skill_match": 0
        }

    # ==========================================
    # Get student's skills
    # ==========================================

    cursor.execute(
        """
        SELECT skill_name
        FROM skills
        WHERE user_id = ?
        """,
        (user_id,)
    )

    student_skills = cursor.fetchall()

    # ==========================================
    # Get required skills for selected career
    # ==========================================

    required_skills = career_requirements.get(
        career,
        []
    )

    # ==========================================
    # Normalize student's skills
    # ==========================================

    student_skills_lower = {
        skill.strip().lower()
        for skill in student_skills
    }

    # ==========================================
    # Find matched skills
    # ==========================================

    matched_skills = []

    for skill in required_skills:

        if skill.strip().lower() in student_skills_lower:
            matched_skills.append(skill)

    # ==========================================
    # Find missing skills
    # ==========================================

    missing_skills = []

    for skill in required_skills:

        if skill.strip().lower() not in student_skills_lower:
            missing_skills.append(skill)

    # ==========================================
    # Calculate skill match percentage
    # ==========================================

    if required_skills:

        skill_match = round(
            (len(matched_skills) / len(required_skills)) * 100
        )

    else:

        skill_match = 0

    conn.close()

    # ==========================================
    # Return result
    # ==========================================

    return {
        "career": career,
        "your_skills": student_skills,
        "required_skills": required_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skill_match": skill_match
    }