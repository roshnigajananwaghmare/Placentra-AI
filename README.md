# Placentra AI

## AI-Powered Student Placement Prediction & Career Guidance Platform

## Project Overview

Placentra AI is a student-focused web platform for organizing academic and career information, estimating placement readiness, and identifying practical next steps. Its central purpose is AI-powered student placement prediction. Resume preparation, career recommendation, skill-gap analysis, and improvement planning are supporting modules built around the same stored student profile.

## Problem Statement

Students often have academic details, projects, skills, internships, certifications, and resumes in separate places. It can be difficult to understand overall placement readiness, identify missing skills, choose a relevant career direction, and decide what to improve next. Placentra AI brings these activities into one guided workflow.

## Objectives

- Collect and maintain a student's academic and career profile.
- Use stored profile information to estimate placement readiness.
- Provide career guidance based on the student's target role and skills.
- Identify missing skills for the selected career direction.
- Help students improve their resume and preparation plan.
- Present the latest available information in a student dashboard.

## Key Features

- Signup and login with hashed passwords
- Guided onboarding with Previous, Continue, and optional Skip navigation
- Student profile management
- Multiple projects, skills, internships, and certifications
- Resume builder with section selection and preview
- ATS resume scoring based on selected resume sections
- Placement prediction using the configured placement model
- Career recommendation
- Skill-gap analysis
- Personalized improvement plan
- Student dashboard with profile, prediction, career, ATS, and preparation summaries

## How It Works

```text
Sign Up → Login → Profile → Projects → Skills → Internships → Certifications
→ Resume → Placement Predictor → Career Recommendation → Skill Gap Analysis
→ Personalized Improvement Plan → Student Dashboard
```

Each onboarding page supports Previous navigation where a prior step exists. Internships and certifications can be skipped. Existing save operations complete before moving forward, and returning to a page loads saved backend data where that page retrieves it.

## Placement Prediction

The main placement prediction endpoint reads the student's saved CGPA, aptitude test score, communication/soft-skills score, and counts of projects, internships, and certifications. The primary runtime model is the saved `placement_ai_model.pkl` Random Forest classifier.

The training script [`backend/train_placement_ai.py`](backend/train_placement_ai.py) uses `backend/model/placementdata.csv`, selects those six numeric placement features, splits the data into 80% training and 20% test sets with `random_state=42` and stratification, trains a 200-estimator balanced `RandomForestClassifier`, and reports accuracy/classification results when training is run. The trained model returns a placement probability for the `Placed` class. If the primary model is unavailable, the backend uses its existing deterministic fallback calculation.

The repository also contains the older `train_model.py` pipeline and related dataset/model artifacts. The running API uses `placement_ai_model.pkl`. Predictions are estimates based on available data and the configured model; no accuracy guarantee is claimed.

## Supporting Modules

- **Career Recommendation:** compares saved skills and academic factors with the selected target role's requirements.
- **Skill Gap Analysis:** reports matched and missing skills for the recommended or selected career direction.
- **ATS Resume Scoring:** scores contact information, education, skills, projects, internships, and certifications from selected resume sections.
- **Personalized Improvement Plan:** combines saved profile data, project/experience counts, ATS score, placement output, career recommendation, and skill-gap results into prioritized actions.

These modules support placement preparation; placement prediction remains the central system purpose.

## Technology Stack

- React 18, TypeScript, Vite, React Router
- Tailwind CSS and Lucide React
- Python, Flask, Flask-CORS, and REST-style HTTP APIs
- SQLite
- pandas, joblib, and scikit-learn
- Random Forest classification
- ReportLab for PDF resume generation

## System Architecture

```text
React + TypeScript frontend
          │ HTTP requests
          ▼
Flask backend API
      │           │
      ├── SQLite database (users, profiles, records, predictions)
      ├── Saved scikit-learn model and training artifacts
      └── ReportLab resume generation
```

The frontend calls the Flask API. The backend reads and writes SQLite records, combines stored student information for dashboard and supporting analyses, and calls the saved placement model for placement scoring.

## Project Structure

```text
project/
├── src/
│   ├── components/       # Shared UI and onboarding components
│   ├── config/           # Shared frontend configuration
│   ├── pages/            # Application pages and feature flows
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Frontend utilities
├── backend/
│   ├── app.py            # Flask API routes
│   ├── database.py       # SQLite schema and data access
│   ├── auth.py           # Signup/login logic
│   ├── train_placement_ai.py
│   ├── model/            # Training datasets
│   ├── placement_ai_model.pkl
│   └── resume_generator.py
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

Local databases, generated PDFs, virtual environments, dependencies, build output, and cache files are intentionally excluded from version control.

## Installation and Setup

### Clone the repository

```powershell
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>\project
```

### Backend setup

From `project\backend`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

The backend creates `placement.db` and its tables automatically on startup. No environment variables are currently required.

### Frontend setup

From `project`:

```powershell
npm install
```

### Run the application

Start the backend from `project\backend`:

```powershell
python app.py
```

In a second terminal, start the frontend from `project`:

```powershell
npm run dev
```

The frontend expects the Flask API at `http://127.0.0.1:5000`. Open the Vite development URL shown in the terminal.

### Optional model retraining

The runtime model is already included. To retrain the active pipeline, run from `project\backend`:

```powershell
python train_placement_ai.py
```

This reads `model\placementdata.csv` and rewrites `placement_ai_model.pkl`.

## Screenshots

No screenshots are included. Add real screenshots after running the application:

```text
screenshots/
├── login.png
├── profile.png
├── projects.png
├── resume.png
├── ats-score.png
├── placement-predictor.png
├── career-recommendation.png
├── skill-gap.png
├── improvement-plan.png
└── dashboard.png
```

## Limitations

- The application is configured for local development and uses a fixed local backend URL.
- Authentication is implemented for the project workflow but is not a production identity/session system.
- Prediction quality depends on the saved model and the completeness and accuracy of student-provided information.
- Prediction and supporting analyses require the backend and database to be available.
- Model artifacts are binary files and may require Git LFS or another artifact strategy if hosting limits are reached.
- The project does not include automated end-to-end browser tests.

## Future Scope

These are not current features:

- Production deployment configuration and managed authentication
- Configurable API and database URLs
- Model versioning, monitoring, and broader evaluation
- More explainable model diagnostics
- Automated browser and API test coverage
- User-controlled resume templates and sharing

## Disclaimer

Placement predictions and career guidance are estimates based on the information stored in the application and the configured model/rules. They are intended for preparation guidance and are not guarantees of placement, employment, or any specific career outcome.

## Author / Project Information

- **Author:** `<YOUR_NAME>`
- **Institution:** `<YOUR_INSTITUTION>`
- **Repository:** `<YOUR_GITHUB_REPOSITORY_URL>`

Replace these placeholders with your own information before publishing.
