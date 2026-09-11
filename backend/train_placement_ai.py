import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. Load Dataset
# ==========================================

df = pd.read_csv("model/placementdata.csv")

print("Dataset loaded successfully!")
print("Shape:", df.shape)

print("Columns:")
print(df.columns.tolist())


# ==========================================
# 2. Clean Column Names
# ==========================================

df.columns = df.columns.str.strip()


# ==========================================
# 3. Check Missing Values
# ==========================================

print("\nMissing values:")

print(df.isnull().sum())


# ==========================================
# 4. Select Features
# ==========================================

features = [

    "CGPA",

    "Internships",

    "Projects",

    "Workshops/Certifications",

    "AptitudeTestScore",

    "SoftSkillsRating"

]

X = df[features]

y = df["PlacementStatus"]


print("\nFeatures used by model:")

print(X.columns.tolist())


# ==========================================
# 5. Split Dataset
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.20,

    random_state=42,

    stratify=y

)


# ==========================================
# 6. Train Random Forest
# ==========================================

model = RandomForestClassifier(

    n_estimators=200,

    random_state=42,

    class_weight="balanced"

)


model.fit(

    X_train,

    y_train

)


# ==========================================
# 7. Evaluate Model
# ==========================================

predictions = model.predict(X_test)


accuracy = accuracy_score(

    y_test,

    predictions

)


print("\n================================")

print("MODEL RESULTS")

print("================================")


print(

    f"Accuracy: {accuracy * 100:.2f}%"

)


print("\nClassification Report:")


print(

    classification_report(

        y_test,

        predictions

    )

)


# ==========================================
# 8. Save Model
# ==========================================

joblib.dump(

    model,

    "placement_ai_model.pkl"

)


print("\n================================")

print("MODEL SAVED SUCCESSFULLY!")

print("================================")


print(

    "placement_ai_model.pkl"

)