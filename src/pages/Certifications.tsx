import { useEffect, useState } from "react";
import { Award, Trash2, Plus, CalendarDays, Building2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { OnboardingProgress, ContinueStep, markOnboardingStep } from "../components/OnboardingProgress";

interface Certification {
  id: number;
  certificate_name: string;
  organization: string;
  completion_date: string;
}

export default function Certifications() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    certificate_name: "",
    organization: "",
    completion_date: "",
  });

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/certifications/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        markOnboardingStep("Certifications");
        setCertifications(data.certifications);
      }
    } catch (error) {
      console.error("Error loading certifications:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const addCertification = async () => {
    if (
      !form.certificate_name.trim() ||
      !form.organization.trim() ||
      !form.completion_date.trim()
    ) {
      alert("Please fill in all certification details.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:5000/certifications/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (data.success) {
        setForm({
          certificate_name: "",
          organization: "",
          completion_date: "",
        });

        loadCertifications();
      }
    } catch (error) {
      console.error("Error adding certification:", error);
      alert("Unable to add certification.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCertification = async (
    certificationId: number
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this certification?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/certifications/${certificationId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      if (data.success) {
        loadCertifications();
      }
    } catch (error) {
      console.error("Error deleting certification:", error);
      alert("Unable to delete certification.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <OnboardingProgress current="Certifications" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
            <Award
              size={30}
              className="text-yellow-600 dark:text-yellow-400"
            />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">
              My Certifications
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Showcase your achievements and professional certifications.
            </p>
          </div>
        </div>
      </div>

      {/* Add Certification */}
      <Card className="mb-10 overflow-hidden">
        <CardContent className="p-6 md:p-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-brand-100 dark:bg-brand-900/30">
              <Plus
                size={20}
                className="text-brand-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Add Certification
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a certificate you've completed.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="Certificate Name"
              name="certificate_name"
              placeholder="e.g. Python for Data Science"
              value={form.certificate_name}
              onChange={handleChange}
            />

            <Input
              label="Organization"
              name="organization"
              placeholder="e.g. IBM, AWS, Google"
              value={form.organization}
              onChange={handleChange}
            />

            <Input
              label="Completion Date"
              name="completion_date"
              type="date"
              value={form.completion_date}
              onChange={handleChange}
            />

          </div>

          <div className="mt-6">
            <Button
              onClick={addCertification}
              disabled={loading}
              className="w-full md:w-auto px-8"
            >
              <Plus size={18} className="mr-2" />

              {loading
                ? "Adding..."
                : "Add Certification"}
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Certification Count */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-2xl font-bold">
            Your Certifications
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {certifications.length} certification
            {certifications.length !== 1 ? "s" : ""} added
          </p>
        </div>
        <ContinueStep to="/resume" label="Continue to Resume" optional={certifications.length === 0} />
      </div>

      {/* Empty State */}
      {certifications.length === 0 && (
        <Card>
          <CardContent className="py-14 text-center">

            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
              <Award
                size={32}
                className="text-yellow-600 dark:text-yellow-400"
              />
            </div>

            <h3 className="text-xl font-semibold">
              No certifications yet
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Add your first certification above to strengthen your profile.
            </p>

          </CardContent>
        </Card>
      )}

      {/* Certification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {certifications.map((certificate) => (

          <Card
            key={certificate.id}
            hover
            className="group border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
          >

            <CardContent className="p-6">

              {/* Top */}
              <div className="flex justify-between items-start gap-4">

                <div className="flex items-start gap-4">

                  <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 shrink-0">

                    <Award
                      size={24}
                      className="text-yellow-600 dark:text-yellow-400"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold leading-tight">
                      {certificate.certificate_name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">

                      <Building2 size={16} />

                      <span className="text-sm">
                        {certificate.organization}
                      </span>

                    </div>

                  </div>

                </div>

                <Button
                  variant="secondary"
                  onClick={() =>
                    deleteCertification(certificate.id)
                  }
                  className="shrink-0 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </Button>

              </div>

              {/* Date */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">

                  <CalendarDays size={16} />

                  <span>
                    Completed: {certificate.completion_date}
                  </span>

                </div>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>

    </div>
  );
}