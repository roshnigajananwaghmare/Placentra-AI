def calculate_ats_score(resume):

    profile = resume.get("profile", {})
    skills = resume.get("skills", [])
    projects = resume.get("projects", [])
    internships = resume.get("internships", [])
    certifications = resume.get("certifications", [])

    score = 0
    suggestions = []

    # -------------------------
    # Contact Information
    # -------------------------

    if profile.get("phone"):
        score += 5
    else:
        suggestions.append("Add your phone number.")

    if profile.get("linkedin"):
        score += 5
    else:
        suggestions.append("Add your LinkedIn profile.")

    if profile.get("github"):
        score += 5
    else:
        suggestions.append("Add your GitHub profile.")

    # -------------------------
    # Education
    # -------------------------

    if profile.get("college"):
        score += 5

    if profile.get("degree"):
        score += 5

    if profile.get("cgpa"):
        score += 5

    # -------------------------
    # Skills
    # -------------------------

    skill_count = len(skills)

    if skill_count >= 8:
        score += 20
    elif skill_count >= 5:
        score += 15
    elif skill_count >= 3:
        score += 10
    else:
        suggestions.append("Add more technical skills.")

    # -------------------------
    # Projects
    # -------------------------

    project_count = len(projects)

    if project_count >= 3:
        score += 20
    elif project_count >= 2:
        score += 15
    elif project_count >= 1:
        score += 10
    else:
        suggestions.append("Add at least one project.")

    # -------------------------
    # Internships
    # -------------------------

    internship_count = len(internships)

    if internship_count >= 2:
        score += 15
    elif internship_count >= 1:
        score += 10
    else:
        suggestions.append("Add internship experience.")

    # -------------------------
    # Certifications
    # -------------------------

    certification_count = len(certifications)

    if certification_count >= 3:
        score += 10
    elif certification_count >= 1:
        score += 5
    else:
        suggestions.append("Add certifications.")

    return {
        "score": min(score, 100),
        "suggestions": suggestions
    }