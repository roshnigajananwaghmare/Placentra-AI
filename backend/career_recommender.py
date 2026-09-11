from career_requirements import career_requirements


def recommend_career(profile, skills):

    # ==========================================
    # Get student's target role
    # ==========================================

    target_role = profile.get("target_role")

    if not target_role:
        return {
            "career": "No Target Role Selected",
            "confidence": 0,
            "reason": [
                "Please select a target career role first"
            ],
            "recommended_skills": []
        }

    # ==========================================
    # Get required skills for target role
    # ==========================================

    required_skills = career_requirements.get(
        target_role,
        []
    )

    # ==========================================
    # Get student's current skills
    # ==========================================

    student_skills = [
        skill["skill_name"].strip().lower()
        for skill in skills
    ]

    # ==========================================
    # Calculate skill match
    # ==========================================

    matched_skills = []

    for skill in required_skills:

        if skill.lower() in student_skills:

            matched_skills.append(skill)

    if required_skills:

        skill_match = (
            len(matched_skills) /
            len(required_skills)
        ) * 100

    else:

        skill_match = 0

    # ==========================================
    # Academic / aptitude factors
    # ==========================================

    cgpa = float(
        profile.get("cgpa") or 0
    )

    aptitude = float(
        profile.get("aptitude_score") or 0
    )

    communication = float(
        profile.get("communication_score") or 0
    )

    # Normalize CGPA to percentage
    cgpa_score = min(
        (cgpa / 10) * 100,
        100
    )

    aptitude_score = min(
        aptitude,
        100
    )

    communication_score = min(
        (communication / 10) * 100,
        100
    )

    # ==========================================
    # Calculate career readiness
    # ==========================================

    readiness = (

        skill_match * 0.50

        + cgpa_score * 0.20

        + aptitude_score * 0.20

        + communication_score * 0.10

    )

    readiness = round(
        min(readiness, 100)
    )

    # ==========================================
    # Determine missing skills
    # ==========================================

    missing_skills = [

        skill

        for skill in required_skills

        if skill.lower() not in student_skills

    ]

    # ==========================================
    # Generate reasons
    # ==========================================

    reasons = []

    if skill_match >= 70:

        reasons.append(
            "Strong match with the required technical skills"
        )

    elif skill_match >= 40:

        reasons.append(
            "Several relevant technical skills are already present"
        )

    else:

        reasons.append(
            "Several important skills still need to be developed"
        )

    if cgpa >= 8:

        reasons.append(
            "Strong academic performance"
        )

    elif cgpa >= 7:

        reasons.append(
            "Good academic performance"
        )

    if aptitude >= 80:

        reasons.append(
            "Good aptitude performance"
        )

    if communication >= 7:

        reasons.append(
            "Good communication skills"
        )

    # ==========================================
    # Return recommendation
    # ==========================================

    return {

        "career": target_role,

        "confidence": readiness,

        "matched_skills": matched_skills,

        "missing_skills": missing_skills,

        "reason": reasons,

        "recommended_skills": missing_skills

    }