import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Briefcase,
  Check,
  ChevronRight,
  Download,
  FileText,
  Github,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  Target,
  User,
  X
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/Card";

import { Button } from "../components/ui/Button";
import { ContinueStep, OnboardingProgress, PreviousStep, markOnboardingStep } from "../components/OnboardingProgress";

const API_URL = "http://127.0.0.1:5000";

type SectionKey =
  | "summary"
  | "education"
  | "skills"
  | "projects"
  | "internships"
  | "certifications";

interface ResumeProfile {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  college?: string;
  degree?: string;
  branch?: string;
  year?: string | number;
  cgpa?: string | number;
  target_role?: string;
  career_objective?: string;
  address?: string;
}

interface Skill {
  id?: number;
  skill_id?: number;
  skill_name?: string;
  skill_type?: string;
  proficiency?: string;
}

interface Project {
  id?: number;
  project_id?: number;
  project_name?: string;
  technologies?: string;
  description?: string;
  github_link?: string;
}

interface Internship {
  id?: number;
  internship_id?: number;
  role?: string;
  company_name?: string;
  duration?: string;
  mode?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

interface Certification {
  id?: number;
  certification_id?: number;
  certificate_name?: string;
  organization?: string;
  completion_date?: string;
}

interface ResumeData {
  profile?: ResumeProfile;
  skills?: Skill[];
  projects?: Project[];
  internships?: Internship[];
  certifications?: Certification[];
  ats?: {
    score?: number;
    selected_sections?: string[];
  };
}

interface SectionOption {
  id: SectionKey;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SECTION_OPTIONS: SectionOption[] = [
  {
    id: "summary",
    title: "Professional Summary",
    description: "Career objective and professional introduction",
    icon: <User size={18} />
  },
  {
    id: "education",
    title: "Education",
    description: "Degree, college, branch, year and CGPA",
    icon: <GraduationCap size={18} />
  },
  {
    id: "skills",
    title: "Skills",
    description: "Technical and soft skills",
    icon: <Target size={18} />
  },
  {
    id: "projects",
    title: "Projects",
    description: "Academic and personal projects",
    icon: <FileText size={18} />
  },
  {
    id: "internships",
    title: "Internships",
    description: "Internship and practical experience",
    icon: <Briefcase size={18} />
  },
  {
    id: "certifications",
    title: "Certifications",
    description: "Completed certifications and courses",
    icon: <Award size={18} />
  }
];

const DEFAULT_SELECTED_SECTIONS: SectionKey[] = [
  "summary",
  "education",
  "skills",
  "projects",
  "internships",
  "certifications"
];

export default function Resume() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [resume, setResume] = useState<ResumeData | null>(null);

  const [selectedSections, setSelectedSections] =
    useState<SectionKey[]>(
      DEFAULT_SELECTED_SECTIONS
    );

  const [atsScore, setAtsScore] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // LOAD RESUME DATA
  // ==========================================================

  useEffect(() => {
    if (!user?.id) {
      setError(
        "User information could not be found. Please login again."
      );

      setLoading(false);
      return;
    }

    loadResume();
  }, [user?.id]);

  const loadResume = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/resume/${user.id}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to load resume information."
        );
      }

      setResume(data.resume || {});

      // If backend already has a selection,
      // restore it.
      if (
        data.resume?.ats?.selected_sections &&
        Array.isArray(
          data.resume.ats.selected_sections
        )
      ) {
        const backendSections =
          data.resume.ats.selected_sections.filter(
            (section: string): section is SectionKey =>
              SECTION_OPTIONS.some(
                (option) =>
                  option.id === section
              )
          );

        if (backendSections.length > 0) {
          setSelectedSections(
            backendSections
          );
        }
      }

      if (
        typeof data.resume?.ats?.score ===
        "number"
      ) {
        setAtsScore(
          data.resume.ats.score
        );
      }
    } catch (err) {
      console.error(
        "Resume loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SECTION SELECTION
  // ==========================================================

  const toggleSection = (
    section: SectionKey
  ) => {
    setSelectedSections((previous) => {
      if (previous.includes(section)) {
        return previous.filter(
          (item) => item !== section
        );
      }

      return [
        ...previous,
        section
      ];
    });

    setSuccessMessage("");
  };

  const selectAllSections = () => {
    setSelectedSections(
      DEFAULT_SELECTED_SECTIONS
    );

    setSuccessMessage("");
  };

  const clearAllSections = () => {
    setSelectedSections([]);

    setAtsScore(null);
    setSuccessMessage("");
  };

  // ==========================================================
  // GENERATE RESUME
  // ==========================================================

  const generateResume = async () => {
    if (selectedSections.length === 0) {
      setError(
        "Please select at least one resume section."
      );

      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/resume/generate/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            selected_sections:
              selectedSections
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to generate resume."
        );
      }

      if (data.resume) {
        setResume(data.resume);
        markOnboardingStep("Resume");
      }

      if (
        typeof data.ats_score === "number"
      ) {
        setAtsScore(
          data.ats_score
        );
      }

      if (
        Array.isArray(
          data.selected_sections
        )
      ) {
        const validSections =
          data.selected_sections.filter(
            (section: string): section is SectionKey =>
              SECTION_OPTIONS.some(
                (option) =>
                  option.id === section
              )
          );

        if (validSections.length > 0) {
          setSelectedSections(
            validSections
          );
        }
      }

      setSuccessMessage(
        "Resume generated successfully."
      );
    } catch (err) {
      console.error(
        "Resume generation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate resume."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================================
  // DOWNLOAD RESUME
  // ==========================================================

  const downloadResume = async () => {
    if (selectedSections.length === 0) {
      setError(
        "Please select at least one resume section."
      );

      return;
    }

    try {
      setDownloading(true);
      setError("");
      setSuccessMessage("");

      const sections =
        selectedSections.join(",");

      const response = await fetch(
        `${API_URL}/resume/download/${user.id}?sections=${encodeURIComponent(
          sections
        )}`
      );

      if (!response.ok) {
        let message =
          "Unable to download resume.";

        try {
          const data =
            await response.json();

          if (data.message) {
            message = data.message;
          }
        } catch {
          // Response may be a PDF error
        }

        throw new Error(message);
      }

      const blob =
        await response.blob();

      if (
        blob.type &&
        !blob.type.includes(
          "pdf"
        )
      ) {
        throw new Error(
          "The server did not return a valid PDF."
        );
      }

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "PlacentraAI_Resume.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      setSuccessMessage(
        "Resume downloaded successfully."
      );
    } catch (err) {
      console.error(
        "Resume download error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download resume."
      );
    } finally {
      setDownloading(false);
    }
  };

  // ==========================================================
  // ATS SCORE
  // ==========================================================

  const calculatedScore =
    useMemo(() => {
      if (!resume) {
        return 0;
      }

      const profile =
        resume.profile || {};

      const skills =
        resume.skills || [];

      const projects =
        resume.projects || [];

      const internships =
        resume.internships || [];

      const certifications =
        resume.certifications || [];

      let score = 0;
      let maximum = 0;

      // Contact details are always important
      maximum += 15;

      const contactFields = [
        profile.full_name ||
          profile.name,
        profile.email,
        profile.phone,
        profile.linkedin,
        profile.github
      ];

      const completedContactFields =
        contactFields.filter(
          (value) =>
            value &&
            String(value).trim()
        ).length;

      score += Math.round(
        (completedContactFields /
          5) *
          15
      );

      // Education
      if (
        selectedSections.includes(
          "education"
        )
      ) {
        maximum += 15;

        const educationFields = [
          profile.college,
          profile.degree,
          profile.branch,
          profile.year,
          profile.cgpa
        ];

        const completedEducation =
          educationFields.filter(
            (value) =>
              value &&
              String(value).trim()
          ).length;

        score += Math.round(
          (completedEducation /
            5) *
            15
        );
      }

      // Skills
      if (
        selectedSections.includes(
          "skills"
        )
      ) {
        maximum += 20;

        if (skills.length >= 8) {
          score += 20;
        } else if (
          skills.length >= 5
        ) {
          score += 16;
        } else if (
          skills.length >= 3
        ) {
          score += 12;
        } else if (
          skills.length >= 1
        ) {
          score += 7;
        }
      }

      // Projects
      if (
        selectedSections.includes(
          "projects"
        )
      ) {
        maximum += 20;

        if (
          projects.length >= 3
        ) {
          score += 20;
        } else if (
          projects.length === 2
        ) {
          score += 17;
        } else if (
          projects.length === 1
        ) {
          score += 10;
        }
      }

      // Internships
      if (
        selectedSections.includes(
          "internships"
        )
      ) {
        maximum += 10;

        if (
          internships.length >= 2
        ) {
          score += 10;
        } else if (
          internships.length === 1
        ) {
          score += 8;
        }
      }

      // Certifications
      if (
        selectedSections.includes(
          "certifications"
        )
      ) {
        maximum += 10;

        if (
          certifications.length >= 3
        ) {
          score += 10;
        } else if (
          certifications.length === 2
        ) {
          score += 8;
        } else if (
          certifications.length === 1
        ) {
          score += 5;
        }
      }

      if (maximum === 0) {
        return 0;
      }

      return Math.min(
        100,
        Math.round(
          (score / maximum) *
            100
        )
      );
    }, [
      resume,
      selectedSections
    ]);

  const displayedAtsScore =
    atsScore !== null
      ? atsScore
      : calculatedScore;

  // ==========================================================
  // PROFILE HELPERS
  // ==========================================================

  const profile =
    resume?.profile || {};

  const fullName =
    profile.full_name ||
    profile.name ||
    "Your Name";

  const targetRole =
    profile.target_role ||
    "Target Role";

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            size={34}
            className="animate-spin text-blue-600"
          />

          <p className="text-gray-500">
            Loading your resume...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <OnboardingProgress current="Resume" />
        <PreviousStep to="/certifications" />

        {/* ==================================================
            PAGE HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">

              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText
                  size={23}
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                AI Resume Generator
              </h1>

            </div>

            <p className="text-gray-500 max-w-2xl">
              Build a professional,
              ATS-friendly resume by
              choosing exactly what you
              want to include.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <Button
              onClick={
                generateResume
              }
              disabled={
                generating ||
                selectedSections.length ===
                  0
              }
            >
              {generating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles
                    size={17}
                  />
                  Generate Resume
                </>
              )}
            </Button>

            <Button
              onClick={
                downloadResume
              }
              disabled={
                downloading ||
                selectedSections.length ===
                  0
              }
            >
              {downloading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Downloading...
                </>
              ) : (
                <>
                  <Download
                    size={17}
                  />
                  Download PDF
                </>
              )}
            </Button>

          </div>
        </div>

        {/* ==================================================
            ERROR / SUCCESS
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3 text-red-700">

            <X
              size={18}
              className="mt-0.5"
            />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 text-green-700">

            <Check
              size={18}
            />

            <p className="font-medium">
              {successMessage}
            </p>

          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-7">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-6">

            {/* ATS CARD */}

            <Card className="overflow-hidden">

              <CardHeader>
                <CardTitle>
                  Resume ATS Score
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="flex items-center gap-5">

                  <div className="relative w-24 h-24 flex-shrink-0">

                    <svg
                      className="w-24 h-24 -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                      />

                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={
                          2 *
                          Math.PI *
                          42
                        }
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          42 *
                          (1 -
                            displayedAtsScore /
                              100)
                        }
                        className={
                          displayedAtsScore >=
                          80
                            ? "text-green-500"
                            : displayedAtsScore >=
                              60
                            ? "text-blue-500"
                            : "text-orange-500"
                        }
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">
                        {displayedAtsScore}%
                      </span>

                      <span className="text-[10px] text-gray-500">
                        ATS
                      </span>
                    </div>

                  </div>

                  <div>

                    <p className="font-semibold text-slate-900">

                      {displayedAtsScore >=
                      80
                        ? "Strong Resume"
                        : displayedAtsScore >=
                          60
                        ? "Good Start"
                        : "Needs Improvement"}

                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Add relevant skills,
                      projects and experience
                      to improve your score.
                    </p>

                  </div>

                </div>

              </CardContent>
            </Card>

            {/* SECTION SELECTOR */}

            <Card>

              <CardHeader>

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <CardTitle>
                      Choose Resume Sections
                    </CardTitle>

                    <p className="text-sm text-gray-500 mt-1">
                      Select what should appear
                      in your resume.
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                    {
                      selectedSections.length
                    }{" "}
                    / 6
                  </span>

                </div>

              </CardHeader>

              <CardContent>

                <div className="flex gap-2 mb-4">

                  <button
                    type="button"
                    onClick={
                      selectAllSections
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Select all
                  </button>

                  <span className="text-gray-300">
                    |
                  </span>

                  <button
                    type="button"
                    onClick={
                      clearAllSections
                    }
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>

                </div>

                <div className="space-y-3">

                  {SECTION_OPTIONS.map(
                    (section) => {

                      const selected =
                        selectedSections.includes(
                          section.id
                        );

                      return (
                        <button
                          key={
                            section.id
                          }
                          type="button"
                          onClick={() =>
                            toggleSection(
                              section.id
                            )
                          }
                          className={`w-full text-left rounded-xl border p-4 transition-all ${
                            selected
                              ? "border-blue-300 bg-blue-50/60"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {selected ? (
                                <Check
                                  size={17}
                                />
                              ) : (
                                section.icon
                              )}
                            </div>

                            <div className="flex-1 min-w-0">

                              <p className="font-semibold text-sm text-slate-900">
                                {
                                  section.title
                                }
                              </p>

                              <p className="text-xs text-gray-500 mt-1 leading-5">
                                {
                                  section.description
                                }
                              </p>

                            </div>

                            <ChevronRight
                              size={17}
                              className={`mt-1 transition-transform ${
                                selected
                                  ? "text-blue-500 rotate-90"
                                  : "text-gray-400"
                              }`}
                            />

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </CardContent>
            </Card>

            {/* TIPS */}

            <Card>

              <CardContent>

                <div className="flex items-start gap-3">

                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles
                      size={18}
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-slate-900">
                      ATS Tip
                    </p>

                    <p className="text-sm text-gray-500 mt-1 leading-6">
                      For most fresher roles,
                      keep Education, Skills
                      and Projects selected.
                      Add Internships and
                      Certifications when
                      they are relevant to
                      the job.
                    </p>

                  </div>

                </div>

              </CardContent>
            </Card>

          </div>

          {/* =================================================
              RIGHT SIDE - RESUME PREVIEW
          ================================================= */}

          <div>

            <Card className="overflow-hidden">

              <CardHeader className="border-b">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <CardTitle>
                      Resume Preview
                    </CardTitle>

                    <p className="text-sm text-gray-500 mt-1">
                      This preview represents
                      the sections that will be
                      included in your PDF.
                    </p>

                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs text-green-600 font-semibold">

                    <span className="w-2 h-2 rounded-full bg-green-500" />

                    Live Preview

                  </div>

                </div>

              </CardHeader>

              <CardContent className="p-0">

                <div className="bg-gray-100 p-4 md:p-7 overflow-x-auto">

                  {/* =========================================
                      ACTUAL RESUME
                  ========================================= */}

                  <div className="bg-white max-w-[820px] mx-auto shadow-sm min-h-[1100px] p-7 md:p-10 text-slate-900">

                    {/* HEADER */}

                    <div className="text-center border-b border-gray-200 pb-5">

                      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        {fullName}
                      </h2>

                      {targetRole && (
                        <p className="text-blue-600 font-semibold mt-1">
                          {targetRole}
                        </p>
                      )}

                      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">

                        {profile.email && (
                          <span className="flex items-center gap-1">
                            <Mail
                              size={12}
                            />
                            {
                              profile.email
                            }
                          </span>
                        )}

                        {profile.phone && (
                          <span className="flex items-center gap-1">
                            <Phone
                              size={12}
                            />
                            {
                              profile.phone
                            }
                          </span>
                        )}

                        {profile.linkedin && (
                          <span>
                            {
                              profile.linkedin
                            }
                          </span>
                        )}

                        {profile.github && (
                          <span className="flex items-center gap-1">
                            <Github
                              size={12}
                            />
                            {
                              profile.github
                            }
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ATS SCORE */}

                    <div className="mt-5 flex justify-end">

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">

                        <span className="text-xs font-semibold text-gray-500">
                          ATS SCORE
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            displayedAtsScore >=
                            80
                              ? "text-green-600"
                              : displayedAtsScore >=
                                60
                              ? "text-blue-600"
                              : "text-orange-600"
                          }`}
                        >
                          {
                            displayedAtsScore
                          }%
                        </span>

                      </div>

                    </div>

                    {/* =====================================
                        SUMMARY
                    ===================================== */}

                    {selectedSections.includes(
                      "summary"
                    ) && (
                      <ResumePreviewSection
                        title="Professional Summary"
                      >
                        <p className="text-sm leading-6 text-gray-700">
                          {profile.career_objective ||
                            `Motivated student seeking opportunities as a ${targetRole}. Interested in developing practical technical skills, solving real-world problems and contributing to a professional team.`}
                        </p>
                      </ResumePreviewSection>
                    )}

                    {/* =====================================
                        EDUCATION
                    ===================================== */}

                    {selectedSections.includes(
                      "education"
                    ) && (
                      <ResumePreviewSection
                        title="Education"
                      >

                        <div className="flex justify-between gap-4">

                          <div>

                            <h3 className="font-bold text-sm">
                              {
                                profile.degree ||
                                "Degree"
                              }
                            </h3>

                            {profile.branch && (
                              <p className="text-sm text-gray-700 mt-1">
                                {
                                  profile.branch
                                }
                              </p>
                            )}

                            {profile.college && (
                              <p className="text-sm text-gray-600 mt-1">
                                {
                                  profile.college
                                }
                              </p>
                            )}

                          </div>

                          <div className="text-right text-xs text-gray-500">

                            {profile.year && (
                              <p>
                                {
                                  profile.year
                                }
                              </p>
                            )}

                            {profile.cgpa && (
                              <p className="mt-1">
                                CGPA:{" "}
                                {
                                  profile.cgpa
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </ResumePreviewSection>
                    )}

                    {/* =====================================
                        SKILLS
                    ===================================== */}

                    {selectedSections.includes(
                      "skills"
                    ) && (
                      <ResumePreviewSection
                        title="Skills"
                      >

                        {resume?.skills &&
                        resume.skills.length >
                          0 ? (
                          <div className="flex flex-wrap gap-2">

                            {resume.skills.map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={
                                    skill.id ||
                                    skill.skill_id ||
                                    index
                                  }
                                  className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700"
                                >
                                  {
                                    skill.skill_name
                                  }
                                </span>
                              )
                            )}

                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No skills added yet.
                          </p>
                        )}

                      </ResumePreviewSection>
                    )}

                    {/* =====================================
                        PROJECTS
                    ===================================== */}

                    {selectedSections.includes(
                      "projects"
                    ) && (
                      <ResumePreviewSection
                        title="Projects"
                      >

                        {resume?.projects &&
                        resume.projects.length >
                          0 ? (
                          <div className="space-y-5">

                            {resume.projects.map(
                              (
                                project,
                                index
                              ) => (
                                <div
                                  key={
                                    project.id ||
                                    project.project_id ||
                                    index
                                  }
                                >

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3 className="font-bold text-sm">
                                      {
                                        project.project_name
                                      }
                                    </h3>

                                    {project.technologies && (
                                      <span className="text-xs text-blue-600">
                                        {
                                          project.technologies
                                        }
                                      </span>
                                    )}

                                  </div>

                                  {project.description && (
                                    <p className="text-sm text-gray-700 leading-6 mt-1">
                                      {
                                        project.description
                                      }
                                    </p>
                                  )}

                                  {project.github_link && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      {
                                        project.github_link
                                      }
                                    </p>
                                  )}

                                </div>
                              )
                            )}

                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No projects added yet.
                          </p>
                        )}

                      </ResumePreviewSection>
                    )}

                    {/* =====================================
                        INTERNSHIPS
                    ===================================== */}

                    {selectedSections.includes(
                      "internships"
                    ) && (
                      <ResumePreviewSection
                        title="Internships & Experience"
                      >

                        {resume?.internships &&
                        resume.internships.length >
                          0 ? (
                          <div className="space-y-5">

                            {resume.internships.map(
                              (
                                internship,
                                index
                              ) => (
                                <div
                                  key={
                                    internship.id ||
                                    internship.internship_id ||
                                    index
                                  }
                                >

                                  <div className="flex justify-between gap-4">

                                    <div>

                                      <h3 className="font-bold text-sm">
                                        {
                                          internship.role ||
                                          "Intern"
                                        }
                                      </h3>

                                      {internship.company_name && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {
                                            internship.company_name
                                          }
                                        </p>
                                      )}

                                    </div>

                                    <div className="text-right text-xs text-gray-500">

                                      {internship.duration && (
                                        <p>
                                          {
                                            internship.duration
                                          }
                                        </p>
                                      )}

                                      {internship.mode && (
                                        <p className="mt-1">
                                          {
                                            internship.mode
                                          }
                                        </p>
                                      )}

                                    </div>

                                  </div>

                                  {internship.description && (
                                    <p className="text-sm text-gray-700 leading-6 mt-2">
                                      {
                                        internship.description
                                      }
                                    </p>
                                  )}

                                </div>
                              )
                            )}

                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No internships added yet.
                          </p>
                        )}

                      </ResumePreviewSection>
                    )}

                    {/* =====================================
                        CERTIFICATIONS
                    ===================================== */}

                    {selectedSections.includes(
                      "certifications"
                    ) && (
                      <ResumePreviewSection
                        title="Certifications"
                      >

                        {resume?.certifications &&
                        resume.certifications.length >
                          0 ? (
                          <div className="space-y-3">

                            {resume.certifications.map(
                              (
                                certificate,
                                index
                              ) => (
                                <div
                                  key={
                                    certificate.id ||
                                    certificate.certification_id ||
                                    index
                                  }
                                  className="flex justify-between gap-4"
                                >

                                  <div>

                                    <h3 className="font-semibold text-sm">
                                      {
                                        certificate.certificate_name
                                      }
                                    </h3>

                                    {certificate.organization && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {
                                          certificate.organization
                                        }
                                      </p>
                                    )}

                                  </div>

                                  {certificate.completion_date && (
                                    <span className="text-xs text-gray-500">
                                      {
                                        certificate.completion_date
                                      }
                                    </span>
                                  )}

                                </div>
                              )
                            )}

                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No certifications
                            added yet.
                          </p>
                        )}

                      </ResumePreviewSection>
                    )}

                    {/* EMPTY STATE */}

                    {selectedSections.length ===
                      0 && (
                      <div className="py-20 text-center">

                        <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
                          <FileText
                            size={25}
                          />
                        </div>

                        <h3 className="font-semibold text-slate-900 mt-4">
                          No sections selected
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Select at least one
                          section to build
                          your resume.
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </CardContent>
            </Card>

            {/* SELECTED SECTION SUMMARY */}

            <div className="mt-5 flex flex-wrap items-center gap-2">

              <span className="text-sm font-semibold text-gray-600 mr-1">
                Included:
              </span>

              {selectedSections.map(
                (section) => {

                  const option =
                    SECTION_OPTIONS.find(
                      (item) =>
                        item.id ===
                        section
                    );

                  if (!option) {
                    return null;
                  }

                  return (
                    <span
                      key={section}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"
                    >
                      <Check
                        size={13}
                      />

                      {
                        option.title
                      }
                    </span>
                  );
                }
              )}

            </div>

          </div>
        </div>
        {resume && <ContinueStep to="/placement-predictor" label="Continue to Placement Predictor" showPrevious={false} />}
      </div>
    </div>
  );
}


// ============================================================
// RESUME PREVIEW SECTION COMPONENT
// ============================================================

interface ResumePreviewSectionProps {
  title: string;
  children: React.ReactNode;
}

function ResumePreviewSection({
  title,
  children
}: ResumePreviewSectionProps) {
  return (
    <section className="mt-6">

      <div className="flex items-center gap-2 mb-3">

        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
          {title}
        </h2>

      </div>

      <div className="h-px bg-gray-200 mb-4" />

      {children}

    </section>
  );
}