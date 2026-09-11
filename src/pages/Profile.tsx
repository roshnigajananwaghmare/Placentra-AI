import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { markOnboardingStep, OnboardingProgress, PreviousStep } from "../components/OnboardingProgress";
import { BRANCH_OPTIONS } from "../config/branches";

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({
    college: "",
    degree: "",
    branch: user.branch || "",
    year: "",
    cgpa: "",
    aptitude_score: "",
    communication_score: "",
    target_role: "",
    phone: "",
    linkedin: "",
    github: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/profile/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setProfile((previous) => ({
          ...previous,
          ...data.profile,
        }));
      } else if (data.message !== "Profile not found.") {
        setMessage(data.message || "Unable to load your profile.");
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfile((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/profile/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Profile saved successfully.");
        markOnboardingStep("Profile");
        setTimeout(() => navigate("/projects"), 350);
      } else {
        setMessage(data.message || "Unable to update profile.");
      }
    } catch (error) {
      console.log("Error saving profile:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      profile.college,
      profile.degree,
      profile.branch,
      profile.year,
      profile.cgpa,
      profile.aptitude_score,
      profile.communication_score,
      profile.target_role,
      profile.phone,
      profile.linkedin,
      profile.github,
      profile.address,
    ];

    const completed = fields.filter(
      (field) => field !== null && field !== undefined && field !== ""
    ).length;

    return Math.round((completed / fields.length) * 100);
  };

  const completion = calculateCompletion();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Placentra AI
            </h1>
            <p className="text-sm text-slate-500">
              Student Profile
            </p>
          </div>

          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-slate-200
                       bg-white text-slate-700 text-sm font-medium
                       hover:bg-slate-50 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <OnboardingProgress current="Profile" />
        <PreviousStep to="/login" />

        {/* Profile Hero */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="flex flex-col md:flex-row md:items-center
                          justify-between gap-6">

            <div className="flex items-center gap-5">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-blue-100
                              flex items-center justify-center
                              text-3xl font-bold text-blue-600">
                {(user.full_name || "R").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.full_name || "Student"}
                </h2>

                <p className="text-slate-500 mt-1">
                  {profile.branch || "Computer Engineering"}
                  {" • "}
                  {profile.year || "Final Year"}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {user.email || "Student Account"}
                </p>
              </div>
            </div>

            {/* Completion */}
            <div className="md:w-72">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  Profile Completion
                </span>

                <span className="text-sm font-bold text-blue-600">
                  {completion}%
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              👤 Personal Information
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Keep your personal details up to date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="Phone Number"
              name="phone"
              placeholder="Enter phone number"
              value={profile.phone}
              onChange={handleChange}
            />

            <Input
              label="Address"
              name="address"
              placeholder="Enter your address"
              value={profile.address}
              onChange={handleChange}
            />

          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              🎓 Academic Information
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your academic background helps Placentra AI evaluate your profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="College"
              name="college"
              placeholder="Enter college name"
              value={profile.college}
              onChange={handleChange}
            />

            <Input
              label="Degree"
              name="degree"
              placeholder="Example: B.Tech"
              value={profile.degree}
              onChange={handleChange}
            />

            <Select
              label="Branch"
              name="branch"
              value={profile.branch}
              onChange={handleChange}
              options={
                profile.branch && !BRANCH_OPTIONS.some((option) => option === profile.branch)
                  ? [...BRANCH_OPTIONS, profile.branch]
                  : [...BRANCH_OPTIONS]
              }
            />

            <Input
              label="Year"
              name="year"
              placeholder="Example: Final Year"
              value={profile.year}
              onChange={handleChange}
            />

          </div>
        </section>

        {/* Performance */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              📊 Performance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              These values are used by the placement prediction system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <Input
              label="CGPA"
              name="cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="0 - 10"
              value={profile.cgpa}
              onChange={handleChange}
            />

            <Input
              label="Aptitude Score"
              name="aptitude_score"
              type="number"
              min="0"
              max="100"
              placeholder="0 - 100"
              value={profile.aptitude_score}
              onChange={handleChange}
            />

            <Input
              label="Communication Score"
              name="communication_score"
              type="number"
              min="0"
              max="10"
              placeholder="0 - 10"
              value={profile.communication_score}
              onChange={handleChange}
            />

          </div>
        </section>

        {/* Career */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              🎯 Career Preference
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select the career you want Placentra AI to analyze.
            </p>
          </div>

          <Select
            label="Target Career Role"
            name="target_role"
            value={profile.target_role}
            onChange={handleChange}
            options={[
              "Data Analyst",
              "Data Scientist",
              "ML Engineer",
              "Software Developer",
              "Web Developer",
              "IT Support",
              "Embedded Systems Engineer",
              "IoT Engineer",
              "Electronics Engineer",
              "Mechanical Engineer",
              "Mechanical Design Engineer",
              "Automotive Engineer",
            ]}
          />
        </section>

        {/* Professional Links */}
        <section className="bg-white rounded-2xl border border-slate-200
                            shadow-sm p-6 mb-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              🔗 Professional Links
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Add your professional profiles for your AI Resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="LinkedIn Profile"
              name="linkedin"
              placeholder="https://linkedin.com/in/your-profile"
              value={profile.linkedin}
              onChange={handleChange}
            />

            <Input
              label="GitHub Profile"
              name="github"
              placeholder="https://github.com/your-profile"
              value={profile.github}
              onChange={handleChange}
            />

          </div>
        </section>

        {/* Save Area */}
        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm p-6 flex flex-col md:flex-row
                        items-center justify-between gap-4">

          <div>
            {message && (
              <p
                className={`text-sm font-medium ${
                  message.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {!message && (
              <p className="text-sm text-slate-500">
                Make sure your information is correct before saving.
              </p>
            )}
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-blue-600
                       text-white font-semibold
                       hover:bg-blue-700
                       disabled:opacity-60
                       transition shadow-sm"
          >
            {saving ? "Saving..." : "Continue to Projects"}
          </button>
        </div>

      </main>
    </div>
  );
}


/* =========================================================
   Reusable Input Component
========================================================= */

function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <input
        name={name}
        type={type}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl
                   border border-slate-200
                   bg-slate-50
                   text-slate-900
                   placeholder:text-slate-400
                   outline-none
                   focus:bg-white
                   focus:border-blue-500
                   focus:ring-4
                   focus:ring-blue-100
                   transition"
      />
    </div>
  );
}


/* =========================================================
   Reusable Select Component
========================================================= */

function Select({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl
                   border border-slate-200
                   bg-slate-50
                   text-slate-900
                   outline-none
                   focus:bg-white
                   focus:border-blue-500
                   focus:ring-4
                   focus:ring-blue-100
                   transition"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}