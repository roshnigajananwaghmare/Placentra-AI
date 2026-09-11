import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  Brain,
  Trash2,
  Plus,
  Sparkles,
  Award,
  TrendingUp,
  X,
} from "lucide-react";

import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { OnboardingProgress, ContinueStep, markOnboardingStep } from "../components/OnboardingProgress";

interface Skill {
  id: number;
  skill_name: string;
  skill_type: string;
  proficiency: string;
}

interface SkillForm {
  skill_name: string;
  skill_type: string;
  proficiency: string;
}

export default function Skills() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState<SkillForm>({
    skill_name: "",
    skill_type: "",
    proficiency: "",
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/skills/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        markOnboardingStep("Skills");
        setSkills(data.skills);
      }
    } catch (error) {
      console.error("Error loading skills:", error);
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

  const resetForm = () => {
    setForm({
      skill_name: "",
      skill_type: "",
      proficiency: "",
    });
  };

  const addSkill = async () => {
    if (!form.skill_name || !form.skill_type || !form.proficiency) {
      alert("Please fill in all skill details.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:5000/skills/${user.id}`,
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
        resetForm();
        setShowForm(false);
        loadSkills();
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Unable to add skill.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSkill = async (skillId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/skills/${skillId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      alert(data.message);

      if (data.success) {
        loadSkills();
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      alert("Unable to delete skill.");
    }
  };

  const technicalSkills = useMemo(
    () => skills.filter((skill) => skill.skill_type === "Technical"),
    [skills]
  );

  const softSkills = useMemo(
    () => skills.filter((skill) => skill.skill_type === "Soft Skill"),
    [skills]
  );

  const advancedSkills = useMemo(
    () => skills.filter((skill) => skill.proficiency === "Advanced"),
    [skills]
  );

  const intermediateSkills = useMemo(
    () => skills.filter((skill) => skill.proficiency === "Intermediate"),
    [skills]
  );

  const beginnerSkills = useMemo(
    () => skills.filter((skill) => skill.proficiency === "Beginner"),
    [skills]
  );

  const getProficiencyWidth = (proficiency: string) => {
    if (proficiency === "Advanced") return "100%";
    if (proficiency === "Intermediate") return "65%";
    return "30%";
  };

  const getProficiencyColor = (proficiency: string) => {
    if (proficiency === "Advanced") {
      return "bg-green-500";
    }

    if (proficiency === "Intermediate") {
      return "bg-yellow-500";
    }

    return "bg-red-500";
  };

  const getProficiencyTextColor = (proficiency: string) => {
    if (proficiency === "Advanced") {
      return "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    }

    if (proficiency === "Intermediate") {
      return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    }

    return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingProgress current="Skills" />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-100 dark:bg-brand-900/30">
                <Code2 className="text-brand-600" size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  My Skills
                </h1>

                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Manage your technical and professional skills
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2"
          >
            <Plus size={19} />
            Add Skill
          </Button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <Card hover>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Skills
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {skills.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Code2
                    size={24}
                    className="text-blue-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Technical
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {technicalSkills.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Code2
                    size={24}
                    className="text-purple-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Soft Skills
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {softSkills.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30">
                  <Brain
                    size={24}
                    className="text-pink-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Advanced
                  </p>

                  <p className="text-3xl font-bold mt-2">
                    {advancedSkills.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Award
                    size={24}
                    className="text-green-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ADD SKILL FORM */}
        {showForm && (
          <Card className="mb-8 border-2 border-brand-200 dark:border-brand-900">
            <CardContent>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles
                      size={20}
                      className="text-brand-600"
                    />
                    Add New Skill
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Add a skill to improve your career profile.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <Input
                  label="Skill Name"
                  name="skill_name"
                  placeholder="e.g. Python"
                  value={form.skill_name}
                  onChange={handleChange}
                />

                <div>
                  <label className="label-base">
                    Skill Category
                  </label>

                  <select
                    name="skill_type"
                    value={form.skill_type}
                    onChange={handleChange}
                    className="input-base"
                  >
                    <option value="">
                      Select Category
                    </option>

                    <option value="Technical">
                      Technical
                    </option>

                    <option value="Soft Skill">
                      Soft Skill
                    </option>
                  </select>
                </div>

                <div>
                  <label className="label-base">
                    Proficiency
                  </label>

                  <select
                    name="proficiency"
                    value={form.proficiency}
                    onChange={handleChange}
                    className="input-base"
                  >
                    <option value="">
                      Select Level
                    </option>

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>
                  </select>
                </div>

              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={addSkill}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Plus size={18} />

                  {loading
                    ? "Adding..."
                    : "Add Skill"}
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* EMPTY STATE */}
        {skills.length === 0 && !showForm && (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-5">
                <Sparkles
                  size={30}
                  className="text-brand-600"
                />
              </div>

              <h2 className="text-xl font-bold">
                No skills added yet
              </h2>

              <p className="text-gray-500 mt-2 mb-6">
                Start building your career profile by adding
                your skills.
              </p>

              <Button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Your First Skill
              </Button>

            </CardContent>
          </Card>
        )}

        {/* PROFICIENCY SUMMARY */}
        {skills.length > 0 && (
          <Card className="mb-8">
            <CardContent>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/30">
                  <TrendingUp
                    size={22}
                    className="text-brand-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Skill Proficiency
                  </h2>

                  <p className="text-sm text-gray-500">
                    Overview of your current skill levels
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">

                <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-2xl font-bold text-red-600">
                    {beginnerSkills.length}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Beginner
                  </p>
                </div>

                <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-2xl font-bold text-yellow-600">
                    {intermediateSkills.length}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Intermediate
                  </p>
                </div>

                <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600">
                    {advancedSkills.length}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Advanced
                  </p>
                </div>

              </div>

            </CardContent>
          </Card>
        )}

        {/* TECHNICAL SKILLS */}
        {technicalSkills.length > 0 && (
          <section className="mb-8">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Code2
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Technical Skills
                </h2>

                <p className="text-sm text-gray-500">
                  Programming, tools and technical knowledge
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {technicalSkills.map((skill) => (
                <Card
                  key={skill.id}
                  hover
                  className="group border border-gray-200 dark:border-gray-800"
                >
                  <CardContent>

                    <div className="flex justify-between items-start">

                      <div className="flex items-center gap-3">

                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                          <Code2
                            size={21}
                            className="text-blue-600"
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">
                            {skill.skill_name}
                          </h3>

                          <span className="text-xs text-gray-500">
                            Technical Skill
                          </span>
                        </div>

                      </div>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          deleteSkill(skill.id)
                        }
                      >
                        <Trash2 size={17} />
                      </Button>

                    </div>

                    <div className="mt-5">

                      <div className="flex justify-between items-center mb-2">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getProficiencyTextColor(
                            skill.proficiency
                          )}`}
                        >
                          {skill.proficiency}
                        </span>

                        <span className="text-xs text-gray-500">
                          {skill.proficiency === "Advanced"
                            ? "Expert level"
                            : skill.proficiency ===
                              "Intermediate"
                            ? "Developing"
                            : "Getting started"}
                        </span>

                      </div>

                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getProficiencyColor(
                            skill.proficiency
                          )}`}
                          style={{
                            width:
                              getProficiencyWidth(
                                skill.proficiency
                              ),
                          }}
                        />

                      </div>

                    </div>

                  </CardContent>
                </Card>
              ))}

            </div>

          </section>
        )}

        {/* SOFT SKILLS */}
        {softSkills.length > 0 && (
          <section className="mb-8">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-pink-100 dark:bg-pink-900/30">
                <Brain
                  size={22}
                  className="text-pink-600"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Soft Skills
                </h2>

                <p className="text-sm text-gray-500">
                  Communication and professional abilities
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {softSkills.map((skill) => (
                <Card
                  key={skill.id}
                  hover
                  className="group border border-gray-200 dark:border-gray-800"
                >
                  <CardContent>

                    <div className="flex justify-between items-start">

                      <div className="flex items-center gap-3">

                        <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30">
                          <Brain
                            size={21}
                            className="text-pink-600"
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">
                            {skill.skill_name}
                          </h3>

                          <span className="text-xs text-gray-500">
                            Soft Skill
                          </span>
                        </div>

                      </div>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          deleteSkill(skill.id)
                        }
                      >
                        <Trash2 size={17} />
                      </Button>

                    </div>

                    <div className="mt-5">

                      <div className="flex justify-between items-center mb-2">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getProficiencyTextColor(
                            skill.proficiency
                          )}`}
                        >
                          {skill.proficiency}
                        </span>

                        <span className="text-xs text-gray-500">
                          {skill.proficiency === "Advanced"
                            ? "Strong"
                            : skill.proficiency ===
                              "Intermediate"
                            ? "Developing"
                            : "Getting started"}
                        </span>

                      </div>

                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">

                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getProficiencyColor(
                            skill.proficiency
                          )}`}
                          style={{
                            width:
                              getProficiencyWidth(
                                skill.proficiency
                              ),
                          }}
                        />

                      </div>

                    </div>

                  </CardContent>
                </Card>
              ))}

            </div>

          </section>
        )}

        {/* CAREER TIP */}
        {skills.length > 0 && (
          <Card className="border border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-900/10">

            <CardContent>

              <div className="flex gap-4">

                <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900/40 h-fit">
                  <Sparkles
                    size={22}
                    className="text-brand-600"
                  />
                </div>

                <div>

                  <h3 className="font-bold text-lg">
                    Career Profile Tip
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Keep adding relevant skills to improve your
                    Skill Gap Analysis and career recommendations.
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">

                    {advancedSkills.length === 0 && (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">
                        Build advanced skills
                      </span>
                    )}

                    {technicalSkills.length < 3 && (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                        Add more technical skills
                      </span>
                    )}

                    {softSkills.length < 2 && (
                      <span className="text-xs px-3 py-1.5 rounded-full bg-pink-100 text-pink-700">
                        Add soft skills
                      </span>
                    )}

                    {advancedSkills.length > 0 &&
                      technicalSkills.length >= 3 &&
                      softSkills.length >= 2 && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                          Great skill profile!
                        </span>
                      )}

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>
        )}
        <ContinueStep to="/internships" label="Continue to Internships" />

      </div>
    </div>
  );
}