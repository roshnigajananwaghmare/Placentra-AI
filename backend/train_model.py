import pandas as pd
import joblib
import os

print("Current Folder:", os.getcwd())
print("Files:", os.listdir())

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Load dataset
df = pd.read_csv("model/Placement_Data_Full_Class.csv")

# Remove unnecessary columns
df.drop(columns=["sl_no", "salary"], inplace=True)

# Encode categorical columns
label_encoders = {}

categorical_columns = [
    "gender",
    "ssc_b",
    "hsc_b",
    "hsc_s",
    "degree_t",
    "workex",
    "specialisation",
    "status"
]

for column in categorical_columns:
    le = LabelEncoder()
    df[column] = le.fit_transform(df[column])
    label_encoders[column] = le

# Features and target
X = df.drop(columns=["status"])
print(X.columns.tolist())
y = df["status"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

# Train Random Forest
model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"Model Accuracy : {accuracy*100:.2f}%")

# Save model and encoders
joblib.dump(model, "placement_model.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")

print("✅ Model Saved Successfully!")