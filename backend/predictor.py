from datetime import datetime

def generate_prediction(data):

    cgpa = float(data.get("cgpa", 0))
    aptitude = float(data.get("aptitudeScore", 0))
    projects = float(data.get("projects", 0))
    communication = float(data.get("communication", 0))

    score = 0

    # CGPA (30)
    score += (cgpa / 10) * 30

    # Aptitude (25)
    score += (aptitude / 100) * 25

    # Projects (20)
    if projects >= 5:
        score += 20
    elif projects >= 3:
        score += 15
    elif projects >= 1:
        score += 8

    # Internship (15)
    if data.get("internship") == "yes":
        score += 15

    # Communication (10)
    score += (communication / 10) * 10

    # Penalties
    if cgpa < 6:
        score -= 10

    if aptitude < 50:
        score -= 10

    if projects == 0:
        score -= 15

    if data.get("internship") != "yes":
        score -= 5

    score = round(score)
    score = max(0, min(95, score))

    if score >= 80:
        status = "likely"
        statusLabel = "Strong Placement Chances"
    elif score >= 60:
        status = "moderate"
        statusLabel = "Moderate Placement Chances"
    else:
        status = "unlikely"
        statusLabel = "Needs Significant Improvement"

    return {
        "probability": score,
        "status": status,
        "statusLabel": statusLabel,
        "studentName": data.get("fullName", ""),
        "generatedAt": datetime.now().isoformat()
    }