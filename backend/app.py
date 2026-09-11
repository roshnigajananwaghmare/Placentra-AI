import os
import io
import sqlite3
import joblib
import pandas as pd
import flask
from pathlib import Path

from datetime import datetime
from flask import jsonify, request, send_file
from flask_cors import CORS


# ============================================================
# EXTERNAL MODULES
# ============================================================

from predictor import generate_prediction
from auth import register_user, login_user
from career_recommender import recommend_career
from skill_gap import analyze_skill_gap

from database import (
    create_table,
    save_prediction,
    get_all_predictions,

    get_student_profile,
    save_student_profile,

    add_project,
    get_projects,
    delete_project,
    update_project,

    add_skill,
    get_skills,
    delete_skill,

    add_internship,
    get_internships,
    delete_internship,

    add_certification,
    get_certifications,
    delete_certification,

    get_dashboard_summary,
    get_resume_data,
)


# ============================================================
# APP CONFIGURATION
# ============================================================

app = flask.Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    }
)

create_table()


# ============================================================
# LOAD ML MODELS
# ============================================================

try:
    placement_ai_model = joblib.load(BASE_DIR / "placement_ai_model.pkl")
except Exception as error:
    print("Warning: placement_ai_model.pkl could not be loaded.")
    print(error)
    placement_ai_model = None


try:
    model = joblib.load(BASE_DIR / "placement_model.pkl")
except Exception as error:
    print("Warning: placement_model.pkl could not be loaded.")
    print(error)
    model = None


try:
    label_encoders = joblib.load(BASE_DIR / "label_encoders.pkl")
except Exception as error:
    print("Warning: label_encoders.pkl could not be loaded.")
    print(error)
    label_encoders = None


# ============================================================
# HOME
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Placentra AI backend is running successfully",
        "version": "2.0"
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "backend": "running",
        "database": "connected",
        "ml_model": placement_ai_model is not None
    })


# ============================================================
# PREDICTION
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No prediction data received."
            }), 400

        result = generate_prediction(data)

        save_prediction(data, result)

        return jsonify(result)

    except Exception as error:

        print("Prediction Error:", error)

        return jsonify({
            "success": False,
            "message": "Prediction failed.",
            "error": str(error)
        }), 500


# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.route("/history", methods=["GET"])
def history():

    try:

        records = get_all_predictions()

        return jsonify(records)

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load prediction history.",
            "error": str(error)
        }), 500


# ============================================================
# SIGNUP
# ============================================================

@app.route("/signup", methods=["POST"])
def signup():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No registration data received."
            }), 400

        result = register_user(data)

        return jsonify(result)

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Registration failed.",
            "error": str(error)
        }), 500


# ============================================================
# LOGIN
# ============================================================

@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No login data received."
            }), 400

        result = login_user(data)

        return jsonify(result)

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Login failed.",
            "error": str(error)
        }), 500


# ============================================================
# PROFILE - GET
# ============================================================

@app.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    try:

        profile = get_student_profile(user_id)

        if profile:

            return jsonify({
                "success": True,
                "profile": profile
            })

        return jsonify({
            "success": False,
            "message": "Profile not found."
        }), 404

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load profile.",
            "error": str(error)
        }), 500


# ============================================================
# PROFILE - UPDATE
# ============================================================

@app.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No profile data received."
            }), 400

        save_student_profile(user_id, data)

        return jsonify({
            "success": True,
            "message": "Profile updated successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to update profile.",
            "error": str(error)
        }), 500


# ============================================================
# PROJECTS - CREATE
# ============================================================

@app.route("/projects/<int:user_id>", methods=["POST"])
def create_project(user_id):

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No project data received."
            }), 400

        add_project(user_id, data)

        return jsonify({
            "success": True,
            "message": "Project added successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to add project.",
            "error": str(error)
        }), 500


# ============================================================
# PROJECTS - GET
# ============================================================

@app.route("/projects/<int:user_id>", methods=["GET"])
def fetch_projects(user_id):

    try:

        projects = get_projects(user_id)

        return jsonify({
            "success": True,
            "projects": projects
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load projects.",
            "error": str(error)
        }), 500


# ============================================================
# PROJECTS - UPDATE
# ============================================================

@app.route("/projects/<int:project_id>", methods=["PUT"])
def edit_project(project_id):

    try:

        data = request.get_json()

        update_project(project_id, data)

        return jsonify({
            "success": True,
            "message": "Project updated successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to update project.",
            "error": str(error)
        }), 500


# ============================================================
# PROJECTS - DELETE
# ============================================================

@app.route("/projects/<int:project_id>", methods=["DELETE"])
def remove_project(project_id):

    try:

        delete_project(project_id)

        return jsonify({
            "success": True,
            "message": "Project deleted successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to delete project.",
            "error": str(error)
        }), 500


# ============================================================
# SKILLS - CREATE
# ============================================================

@app.route("/skills/<int:user_id>", methods=["POST"])
def create_skill(user_id):

    try:

        data = request.get_json()

        add_skill(user_id, data)

        return jsonify({
            "success": True,
            "message": "Skill added successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to add skill.",
            "error": str(error)
        }), 500


# ============================================================
# SKILLS - GET
# ============================================================

@app.route("/skills/<int:user_id>", methods=["GET"])
def fetch_skills(user_id):

    try:

        skills = get_skills(user_id)

        return jsonify({
            "success": True,
            "skills": skills
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load skills.",
            "error": str(error)
        }), 500


# ============================================================
# SKILLS - DELETE
# ============================================================

@app.route("/skills/<int:skill_id>", methods=["DELETE"])
def remove_skill(skill_id):

    try:

        delete_skill(skill_id)

        return jsonify({
            "success": True,
            "message": "Skill deleted successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to delete skill.",
            "error": str(error)
        }), 500


# ============================================================
# INTERNSHIPS - CREATE
# ============================================================

@app.route("/internships/<int:user_id>", methods=["POST"])
def create_internship(user_id):

    try:

        data = request.get_json()

        add_internship(user_id, data)

        return jsonify({
            "success": True,
            "message": "Internship added successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to add internship.",
            "error": str(error)
        }), 500


# ============================================================
# INTERNSHIPS - GET
# ============================================================

@app.route("/internships/<int:user_id>", methods=["GET"])
def fetch_internships(user_id):

    try:

        internships = get_internships(user_id)

        return jsonify({
            "success": True,
            "internships": internships
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load internships.",
            "error": str(error)
        }), 500


# ============================================================
# INTERNSHIPS - DELETE
# ============================================================

@app.route("/internships/<int:internship_id>", methods=["DELETE"])
def remove_internship(internship_id):

    try:

        delete_internship(internship_id)

        return jsonify({
            "success": True,
            "message": "Internship deleted successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to delete internship.",
            "error": str(error)
        }), 500


# ============================================================
# CERTIFICATIONS - CREATE
# ============================================================

@app.route("/certifications/<int:user_id>", methods=["POST"])
def create_certification(user_id):

    try:

        data = request.get_json()

        add_certification(user_id, data)

        return jsonify({
            "success": True,
            "message": "Certification added successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to add certification.",
            "error": str(error)
        }), 500


# ============================================================
# CERTIFICATIONS - GET
# ============================================================

@app.route("/certifications/<int:user_id>", methods=["GET"])
def fetch_certifications(user_id):

    try:

        certifications = get_certifications(user_id)

        return jsonify({
            "success": True,
            "certifications": certifications
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load certifications.",
            "error": str(error)
        }), 500


# ============================================================
# CERTIFICATIONS - DELETE
# ============================================================

@app.route("/certifications/<int:certification_id>", methods=["DELETE"])
def remove_certification(certification_id):

    try:

        delete_certification(certification_id)

        return jsonify({
            "success": True,
            "message": "Certification deleted successfully."
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to delete certification.",
            "error": str(error)
        }), 500


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/dashboard/<int:user_id>", methods=["GET"])
def dashboard_summary(user_id):

    try:

        summary = get_dashboard_summary(user_id)

        return jsonify({
            "success": True,
            "summary": summary
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load dashboard.",
            "error": str(error)
        }), 500


# ============================================================
# RESUME DATA
# ============================================================

@app.route("/resume/<int:user_id>", methods=["GET"])
def resume(user_id):

    try:

        data = get_resume_data(user_id)

        return jsonify({
            "success": True,
            "resume": data
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to load resume data.",
            "error": str(error)
        }), 500


# ============================================================
# ATS SCORE
# ============================================================

def calculate_resume_ats_score(data, selected_sections=None):

    profile = data.get("profile", {})
    projects = data.get("projects", [])
    skills = data.get("skills", [])
    internships = data.get("internships", [])
    certifications = data.get("certifications", [])

    if selected_sections is None:
        selected_sections = [
            "summary",
            "education",
            "skills",
            "projects",
            "internships",
            "certifications"
        ]

    score = 0
    maximum = 0

    # --------------------------------------------------------
    # CONTACT INFORMATION
    # --------------------------------------------------------

    maximum += 15

    contact_fields = [
        profile.get("full_name"),
        profile.get("email"),
        profile.get("phone"),
        profile.get("linkedin"),
        profile.get("github")
    ]

    contact_completed = sum(
        1 for value in contact_fields
        if value and str(value).strip()
    )

    score += round((contact_completed / 5) * 15)

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    if "education" in selected_sections:

        maximum += 15

        education_fields = [
            profile.get("college"),
            profile.get("degree"),
            profile.get("branch"),
            profile.get("year"),
            profile.get("cgpa")
        ]

        education_completed = sum(
            1 for value in education_fields
            if value and str(value).strip()
        )

        score += round(
            (education_completed / 5) * 15
        )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if "skills" in selected_sections:

        maximum += 20

        if len(skills) >= 8:
            score += 20
        elif len(skills) >= 5:
            score += 16
        elif len(skills) >= 3:
            score += 12
        elif len(skills) >= 1:
            score += 7

    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    if "projects" in selected_sections:

        maximum += 20

        if len(projects) >= 3:
            score += 20
        elif len(projects) == 2:
            score += 17
        elif len(projects) == 1:
            score += 10

    # --------------------------------------------------------
    # INTERNSHIPS
    # --------------------------------------------------------

    if "internships" in selected_sections:

        maximum += 10

        if len(internships) >= 2:
            score += 10
        elif len(internships) == 1:
            score += 8

    # --------------------------------------------------------
    # CERTIFICATIONS
    # --------------------------------------------------------

    if "certifications" in selected_sections:

        maximum += 10

        if len(certifications) >= 3:
            score += 10
        elif len(certifications) == 2:
            score += 8
        elif len(certifications) == 1:
            score += 5

    # --------------------------------------------------------
    # NORMALIZE TO 100
    # --------------------------------------------------------

    if maximum == 0:
        return 0

    final_score = round(
        (score / maximum) * 100
    )

    return min(final_score, 100)


# ============================================================
# ATS SCORE SUMMARY
# ============================================================

@app.route("/ats-score/<int:user_id>", methods=["GET"])
def ats_score_summary(user_id):
    try:
        data = get_resume_data(user_id)
        score = calculate_resume_ats_score(data)

        return jsonify({
            "success": True,
            "score": score
        })

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to load ATS score."
        }), 500


# ============================================================
# RESUME GENERATION
# ============================================================

@app.route("/resume/generate/<int:user_id>", methods=["POST"])
def generate_resume(user_id):

    try:

        data = get_resume_data(user_id)

        request_data = request.get_json() or {}

        selected_sections = request_data.get(
            "selected_sections",
            [
                "summary",
                "education",
                "skills",
                "projects",
                "internships",
                "certifications"
            ]
        )

        ats_score = calculate_resume_ats_score(
            data,
            selected_sections
        )

        return jsonify({
            "success": True,
            "message": "Resume generated successfully.",
            "resume": data,
            "selected_sections": selected_sections,
            "ats_score": ats_score
        })

    except Exception as error:

        print("Resume generation error:", error)

        return jsonify({
            "success": False,
            "message": "Unable to generate resume.",
            "error": str(error)
        }), 500


# ============================================================
# RESUME DOWNLOAD
# ============================================================

@app.route("/resume/download/<int:user_id>", methods=["GET"])
def download_resume(user_id):
    try:
        # ----------------------------------------------------
        # Get complete resume data
        # ----------------------------------------------------
        data = get_resume_data(user_id)

        # ----------------------------------------------------
        # Get selected sections from URL
        #
        # Example:
        # /resume/download/1?sections=summary,skills,projects
        # ----------------------------------------------------
        sections_parameter = request.args.get("sections")

        if sections_parameter:
            selected_sections = [
                section.strip().lower()
                for section in sections_parameter.split(",")
                if section.strip()
            ]
        else:
            selected_sections = [
                "summary",
                "education",
                "skills",
                "projects",
                "internships",
                "certifications"
            ]

        # ----------------------------------------------------
        # Calculate ATS score using selected sections
        # ----------------------------------------------------
        ats_score = calculate_resume_ats_score(
            data,
            selected_sections
        )

        # ----------------------------------------------------
        # Store ATS information
        # ----------------------------------------------------
        data["ats"] = {
            "score": ats_score,
            "selected_sections": selected_sections
        }

        # ----------------------------------------------------
        # Generate PDF
        # ----------------------------------------------------
        try:
            from resume_generator import generate_resume
        except ImportError:
            return jsonify({
                "success": False,
                "message": "resume_generator.py could not be imported."
            }), 500

        # ----------------------------------------------------
        # Create unique filename
        # ----------------------------------------------------
        filename = f"Resume_{user_id}.pdf"

        # ----------------------------------------------------
        # IMPORTANT:
        # Pass selected_sections to PDF generator
        # ----------------------------------------------------
        generate_resume(
            data,
            filename,
            selected_sections=selected_sections
        )

        # ----------------------------------------------------
        # Check whether PDF was created
        # ----------------------------------------------------
        if not os.path.exists(filename):
            return jsonify({
                "success": False,
                "message": "Resume PDF was not created."
            }), 500

        # ----------------------------------------------------
        # Send PDF to frontend
        # ----------------------------------------------------
        return send_file(
            filename,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"PlacentraAI_Resume_{user_id}.pdf"
        )

    except Exception as error:
        print("Resume Download Error:", error)

        return jsonify({
            "success": False,
            "message": "Unable to generate resume PDF.",
            "error": str(error)
        }), 500

# ============================================================
# CAREER RECOMMENDATION
# ============================================================

@app.route("/career/<int:user_id>", methods=["GET"])
def career_recommendation(user_id):

    try:

        profile = get_student_profile(user_id)
        skills = get_skills(user_id)

        if not profile:

            return jsonify({
                "success": False,
                "message": "Profile not found."
            }), 404

        recommendation = recommend_career(
            profile,
            skills
        )

        return jsonify({
            "success": True,
            "recommendation": recommendation
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to generate career recommendation.",
            "error": str(error)
        }), 500


# ============================================================
# SKILL GAP
# ============================================================

@app.route("/skill-gap/<int:user_id>", methods=["GET"])
def skill_gap(user_id):

    try:

        result = analyze_skill_gap(user_id)

        return jsonify({
            "success": True,
            "data": result
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "message": "Unable to analyze skill gap.",
            "error": str(error)
        }), 500


# ============================================================
# PLACEMENT SCORE
# ============================================================

@app.route("/placement-score/<int:user_id>", methods=["GET"])
def placement_score(user_id):

    try:

        profile = get_student_profile(user_id)

        if not profile:

            return jsonify({
                "success": False,
                "message": "Profile not found."
            }), 404

        projects = get_projects(user_id)
        internships = get_internships(user_id)
        certifications = get_certifications(user_id)

        project_count = len(projects)
        internship_count = len(internships)
        certification_count = len(certifications)

        communication_score = float(
            profile.get("communication_score") or 0
        )

        aptitude_score = float(
            profile.get("aptitude_score") or 0
        )

        cgpa = float(
            profile.get("cgpa") or 0
        )

        soft_skill_rating = communication_score / 2

        # ----------------------------------------------------
        # ML MODEL
        # ----------------------------------------------------

        if placement_ai_model is not None:

            model_input = pd.DataFrame([{
                "CGPA": cgpa,
                "Internships": internship_count,
                "Projects": project_count,
                "Workshops/Certifications": certification_count,
                "AptitudeTestScore": aptitude_score,
                "SoftSkillsRating": soft_skill_rating
            }])

            probabilities = (
                placement_ai_model
                .predict_proba(model_input)[0]
            )

            classes = placement_ai_model.classes_

            if "Placed" in classes:

                placed_index = list(classes).index(
                    "Placed"
                )

                probability = probabilities[
                    placed_index
                ]

                score = round(
                    probability * 100
                )

            else:

                score = 0

        else:

            # Fallback calculation if model is unavailable
            score = round(
                (
                    (cgpa / 10) * 30
                    + (aptitude_score / 100) * 25
                    + min(project_count / 3, 1) * 20
                    + min(internship_count / 2, 1) * 15
                    + (communication_score / 10) * 10
                )
            )

        # ----------------------------------------------------
        # IMPROVEMENTS
        # ----------------------------------------------------

        improvements = []

        if internship_count == 0:

            improvements.append(
                "Complete at least one internship to gain practical experience."
            )

        if certification_count == 0:

            improvements.append(
                "Complete relevant certifications to strengthen your profile."
            )

        if project_count < 2:

            improvements.append(
                "Build at least 2 practical projects related to your target role."
            )

        if aptitude_score < 70:

            improvements.append(
                "Improve your aptitude score through regular practice."
            )

        if communication_score < 7:

            improvements.append(
                "Improve your communication and interview skills."
            )

        if cgpa < 7:

            improvements.append(
                "Try to improve your academic performance."
            )

        if not improvements:

            improvements.append(
                "Your profile is well balanced. Continue improving your technical skills."
            )

        return jsonify({

            "success": True,

            "score": score,

            "details": {

                "cgpa": cgpa,

                "aptitude_score": aptitude_score,

                "communication_score": communication_score,

                "projects": project_count,

                "internships": internship_count,

                "certifications": certification_count

            },

            "improvements": improvements

        })

    except Exception as error:

        print("Placement Score Error:", error)

        return jsonify({
            "success": False,
            "message": "Unable to calculate placement score.",
            "error": str(error)
        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )