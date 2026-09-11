import { useEffect, useState } from "react";
import {
  Briefcase,
  Trash2,
  Plus,
  Building2,
  Clock3,
  Monitor,
  MapPin,
  Sparkles,
  CheckCircle2,
  Layers3,
} from "lucide-react";

import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { OnboardingProgress, ContinueStep, markOnboardingStep } from "../components/OnboardingProgress";

interface Internship {
  id: number;
  company_name: string;
  role: string;
  duration: string;
  mode: string;
}

interface InternshipForm {
  company_name: string;
  role: string;
  duration: string;
  mode: string;
}

const emptyForm: InternshipForm = {
  company_name: "",
  role: "",
  duration: "",
  mode: "",
};

export default function Internships() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState<InternshipForm>(emptyForm);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:5000/internships/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error("Error loading internships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const addInternship = async () => {
    if (
      !form.company_name.trim() ||
      !form.role.trim() ||
      !form.duration.trim() ||
      !form.mode
    ) {
      alert("Please fill in all internship details.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://127.0.0.1:5000/internships/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to add internship.");
        return;
      }

      markOnboardingStep("Internships");
      setForm(emptyForm);
      await loadInternships();
    } catch (error) {
      console.error("Error adding internship:", error);
      alert("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  };

  const deleteInternship = async (internshipId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this internship?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/internships/${internshipId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to delete internship.");
        return;
      }

      await loadInternships();
    } catch (error) {
      console.error("Error deleting internship:", error);
      alert("Unable to connect to the backend.");
    }
  };

  const remoteCount = internships.filter(
    (internship) => internship.mode === "Remote"
  ).length;

  const hybridCount = internships.filter(
    (internship) => internship.mode === "Hybrid"
  ).length;

  const onsiteCount = internships.filter(
    (internship) => internship.mode === "Onsite"
  ).length;

  const getModeIcon = (mode: string) => {
    if (mode === "Remote") {
      return <Monitor size={15} />;
    }

    if (mode === "Onsite") {
      return <MapPin size={15} />;
    }

    return <Building2 size={15} />;
  };

  const getModeClasses = (mode: string) => {
    if (mode === "Remote") {
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }

    if (mode === "Hybrid") {
      return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    }

    return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6"><OnboardingProgress current="Internships" /></div>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 sm:py-10">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-7 sm:p-10 mb-8 shadow-xl">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-lg">
                <Briefcase size={31} />
              </div>

              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">
                  Career Profile
                </p>

                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  My Internships
                </h1>

                <p className="text-blue-100 mt-2 max-w-xl">
                  Build your professional experience and strengthen your
                  placement profile.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 text-white">
              <Sparkles size={18} />

              <div>
                <p className="text-xs text-blue-100">
                  Profile Experience
                </p>

                <p className="font-bold">
                  {internships.length > 0 ? "Growing Strong" : "Get Started"}
                </p>
              </div>
              <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-6"><ContinueStep to="/certifications" label="Continue to Certifications" optional={internships.length === 0} /></div>
            </div>

          </div>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-900/90 hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Internships
                  </p>

                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {internships.length}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <Briefcase size={23} />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-900/90 hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Remote
                  </p>

                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {remoteCount}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <Monitor size={23} />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-900/90 hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hybrid
                  </p>

                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {hybridCount}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Layers3 size={23} />
                </div>

              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/90 dark:bg-gray-900/90 hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Onsite
                  </p>

                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {onsiteCount}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                  <MapPin size={23} />
                </div>

              </div>
            </CardContent>
          </Card>

        </div>

        {/* ================= ADD INTERNSHIP ================= */}
        <Card className="border-0 shadow-xl bg-white dark:bg-gray-900 overflow-hidden mb-10">

          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

          <CardContent className="p-6 sm:p-8">

            <div className="flex items-start gap-4 mb-7">

              <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Plus size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Add Internship
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add your practical experience to your Placentra AI profile.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Input
                label="Company Name"
                name="company_name"
                placeholder="e.g. Tata Consultancy Services"
                value={form.company_name}
                onChange={handleChange}
              />

              <Input
                label="Role"
                name="role"
                placeholder="e.g. Data Analyst Intern"
                value={form.role}
                onChange={handleChange}
              />

              <Input
                label="Duration"
                name="duration"
                placeholder="e.g. 3 Months"
                value={form.duration}
                onChange={handleChange}
              />

              <div>
                <label className="label-base">
                  Work Mode
                </label>

                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="input-base w-full"
                >
                  <option value="">
                    Select Work Mode
                  </option>

                  <option value="Remote">
                    Remote
                  </option>

                  <option value="Hybrid">
                    Hybrid
                  </option>

                  <option value="Onsite">
                    Onsite
                  </option>
                </select>
              </div>

            </div>

            <div className="mt-7 flex justify-end">

              <Button
                onClick={addInternship}
                disabled={saving}
                className="w-full md:w-auto px-8"
              >
                <Plus size={18} className="mr-2" />

                {saving ? "Adding Internship..." : "Add Internship"}
              </Button>

            </div>

          </CardContent>
        </Card>

        {/* ================= EXPERIENCE HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">

          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={21}
                className="text-green-500"
              />

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Experience
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Your internships and practical work experience.
            </p>
          </div>

          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 w-fit">
            {internships.length}{" "}
            {internships.length === 1 ? "Internship" : "Internships"}
          </div>

        </div>

        {/* ================= LOADING ================= */}
        {loading ? (

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="p-12 text-center">

              <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 animate-pulse">
                <Briefcase size={26} />
              </div>

              <p className="text-gray-500 dark:text-gray-400">
                Loading your internships...
              </p>

            </CardContent>
          </Card>

        ) : internships.length === 0 ? (

          /* ================= EMPTY STATE ================= */
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="p-12 sm:p-16 text-center">

              <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-600">
                <Briefcase size={34} />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                No internships yet
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
                Your practical experience will appear here. Add your first
                internship above to strengthen your placement profile.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
                <Sparkles size={16} />
                Start building your experience
              </div>

            </CardContent>
          </Card>

        ) : (

          /* ================= INTERNSHIP CARDS ================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {internships.map((internship) => (

              <Card
                key={internship.id}
                className="group border-0 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-900 overflow-hidden"
              >

                <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <CardContent className="p-6">

                  {/* TOP */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-4">

                      <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Building2 size={25} />
                      </div>

                      <div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {internship.company_name}
                        </h3>

                        <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                          {internship.role}
                        </p>

                      </div>

                    </div>

                    <Button
                      variant="secondary"
                      onClick={() =>
                        deleteInternship(internship.id)
                      }
                      className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={18} />
                    </Button>

                  </div>

                  {/* DETAILS */}
                  <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/70 p-4 border border-gray-100 dark:border-gray-700">

                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Clock3 size={16} />
                        Duration
                      </div>

                      <p className="font-semibold mt-2 text-gray-900 dark:text-white">
                        {internship.duration}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/70 p-4 border border-gray-100 dark:border-gray-700">

                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        {getModeIcon(internship.mode)}
                        Work Mode
                      </div>

                      <p className="font-semibold mt-2 text-gray-900 dark:text-white">
                        {internship.mode}
                      </p>

                    </div>

                  </div>

                  {/* FOOTER */}
                  <div className="mt-6 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">

                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm" />

                      Added to placement profile

                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getModeClasses(
                        internship.mode
                      )}`}
                    >
                      {getModeIcon(internship.mode)}
                      {internship.mode}
                    </div>

                  </div>

                </CardContent>
              </Card>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}