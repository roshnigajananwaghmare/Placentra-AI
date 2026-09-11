import {
  FolderKanban,
  Github,
  Trash2,
  Pencil,
  Plus,
  ExternalLink,
  X,
  Layers3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OnboardingProgress, ContinueStep, markOnboardingStep } from "../components/OnboardingProgress";

interface Project {
  id: number;
  project_name: string;
  technologies: string;
  description: string;
  github_link: string;
}

interface ProjectForm {
  project_name: string;
  technologies: string;
  description: string;
  github_link: string;
}

export default function Projects() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const emptyForm: ProjectForm = {
    project_name: "",
    technologies: "",
    description: "",
    github_link: "",
  };

  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  // =========================================================
  // Load Projects
  // =========================================================

  const loadProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://127.0.0.1:5000/projects/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.log("Error loading projects:", error);
      setMessage("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Handle Form Change
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  // =========================================================
  // Add Project
  // =========================================================

  const addProject = async () => {
    if (!form.project_name.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Please enter a project description.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:5000/projects/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        markOnboardingStep("Projects");
        setMessage("Project added successfully.");
        setForm(emptyForm);
        setShowForm(false);
        await loadProjects();
      } else {
        setMessage(data.message || "Unable to add project.");
      }
    } catch (error) {
      console.log("Error adding project:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Start Editing
  // =========================================================

  const startEditing = (project: Project) => {
    setEditingId(project.id);

    setForm({
      project_name: project.project_name || "",
      technologies: project.technologies || "",
      description: project.description || "",
      github_link: project.github_link || "",
    });

    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // Update Project
  // =========================================================

  const updateProject = async () => {
    if (!editingId) return;

    if (!form.project_name.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Please enter a project description.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `http://127.0.0.1:5000/projects/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (data.success) {
        markOnboardingStep("Projects");
        setMessage("Project updated successfully.");

        setEditingId(null);
        setForm(emptyForm);
        setShowForm(false);

        await loadProjects();
      } else {
        setMessage(data.message || "Unable to update project.");
      }
    } catch (error) {
      console.log("Error updating project:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Delete Project
  // =========================================================

  const deleteProject = async (projectId: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(projectId);

      const response = await fetch(
        `http://127.0.0.1:5000/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Project deleted successfully.");
        await loadProjects();
      } else {
        setMessage(data.message || "Unable to delete project.");
      }
    } catch (error) {
      console.log("Error deleting project:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // Cancel Editing
  // =========================================================

  const cancelForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage("");
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          Header
      ===================================================== */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between">

            <div>
              <Link
                to="/"
                className="text-sm text-slate-500 hover:text-blue-600
                           transition"
              >
                ← Back to Dashboard
              </Link>

              <div className="flex items-center gap-3 mt-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100
                                flex items-center justify-center">
                  <FolderKanban
                    size={24}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    My Projects
                  </h1>

                  <p className="text-sm text-slate-500">
                    Showcase your projects and technical experience.
                  </p>
                </div>

              </div>
            </div>

            <button
              onClick={() => {
                if (showForm) {
                  cancelForm();
                } else {
                  setShowForm(true);
                  setMessage("");
                }
              }}
              className="hidden sm:flex items-center gap-2
                         px-5 py-3 rounded-xl
                         bg-blue-600 text-white
                         font-semibold
                         hover:bg-blue-700
                         transition shadow-sm"
            >
              {showForm ? (
                <>
                  <X size={18} />
                  Close
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Project
                </>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* =====================================================
          Main Content
      ===================================================== */}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <OnboardingProgress current="Projects" />

        {/* ===================================================
            Statistics
        =================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <StatCard
            icon={<FolderKanban size={22} />}
            title="Total Projects"
            value={projects.length}
          />

          <StatCard
            icon={<Layers3 size={22} />}
            title="Projects Added"
            value={projects.length}
          />

          <StatCard
            icon={<Github size={22} />}
            title="GitHub Projects"
            value={
              projects.filter(
                (project) =>
                  project.github_link &&
                  project.github_link.trim() !== ""
              ).length
            }
          />

        </div>

        {/* ===================================================
            Message
        =================================================== */}

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${
              message.includes("successfully")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* ===================================================
            Add / Edit Form
        =================================================== */}

        {showForm && (
          <section
            className="bg-white rounded-2xl border border-slate-200
                       shadow-sm p-6 mb-10"
          >

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId
                    ? "Edit Project"
                    : "Add New Project"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingId
                    ? "Update your project information."
                    : "Add a project to showcase your technical skills."}
                </p>
              </div>

              <button
                onClick={cancelForm}
                className="p-2 rounded-lg hover:bg-slate-100
                           text-slate-500 transition"
              >
                <X size={20} />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Project Name */}

              <div>
                <label className="block text-sm font-semibold
                                  text-slate-700 mb-2">
                  Project Name
                </label>

                <input
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  placeholder="Example: Student productivity tracker"
                  className="w-full px-4 py-3 rounded-xl
                             border border-slate-200
                             bg-slate-50
                             focus:bg-white
                             focus:border-blue-500
                             focus:ring-4
                             focus:ring-blue-100
                             outline-none transition"
                />
              </div>

              {/* Technologies */}

              <div>
                <label className="block text-sm font-semibold
                                  text-slate-700 mb-2">
                  Technologies
                </label>

                <input
                  name="technologies"
                  value={form.technologies}
                  onChange={handleChange}
                  placeholder="Python, Flask, React, SQL"
                  className="w-full px-4 py-3 rounded-xl
                             border border-slate-200
                             bg-slate-50
                             focus:bg-white
                             focus:border-blue-500
                             focus:ring-4
                             focus:ring-blue-100
                             outline-none transition"
                />

                <p className="text-xs text-slate-400 mt-1">
                  Separate technologies using commas.
                </p>
              </div>

              {/* Description */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold
                                  text-slate-700 mb-2">
                  Project Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe what the project does, the problem it solves, and your contribution."
                  className="w-full px-4 py-3 rounded-xl
                             border border-slate-200
                             bg-slate-50
                             focus:bg-white
                             focus:border-blue-500
                             focus:ring-4
                             focus:ring-blue-100
                             outline-none transition
                             resize-none"
                />

              </div>

              {/* GitHub */}

              <div className="md:col-span-2">

                <label className="block text-sm font-semibold
                                  text-slate-700 mb-2">
                  GitHub Repository
                </label>

                <div className="relative">

                  <Github
                    size={18}
                    className="absolute left-4 top-1/2
                               -translate-y-1/2
                               text-slate-400"
                  />

                  <input
                    name="github_link"
                    value={form.github_link}
                    onChange={handleChange}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-11 pr-4 py-3 rounded-xl
                               border border-slate-200
                               bg-slate-50
                               focus:bg-white
                               focus:border-blue-500
                               focus:ring-4
                               focus:ring-blue-100
                               outline-none transition"
                  />

                </div>

              </div>

            </div>

            {/* Form Buttons */}

            <div className="flex flex-col sm:flex-row
                            justify-end gap-3 mt-6">

              <button
                onClick={cancelForm}
                className="px-5 py-3 rounded-xl
                           border border-slate-200
                           text-slate-700
                           font-semibold
                           hover:bg-slate-50
                           transition"
              >
                Cancel
              </button>

              <button
                onClick={editingId ? updateProject : addProject}
                disabled={saving}
                className="px-6 py-3 rounded-xl
                           bg-blue-600 text-white
                           font-semibold
                           hover:bg-blue-700
                           disabled:opacity-60
                           transition shadow-sm"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Project"
                  : "+ Add Project"}
              </button>

            </div>

          </section>
        )}

        {/* ===================================================
            Project Section Header
        =================================================== */}

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Your Projects
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {projects.length === 0
                ? "Start building your project portfolio."
                : `${projects.length} project${
                    projects.length === 1 ? "" : "s"
                  } in your portfolio.`}
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="sm:hidden flex items-center gap-2
                         px-4 py-2 rounded-lg
                         bg-blue-600 text-white
                         text-sm font-semibold"
            >
              <Plus size={17} />
              Add
            </button>
          )}

        </div>

        {/* ===================================================
            Loading
        =================================================== */}

        {loading && (
          <div className="bg-white rounded-2xl border
                          border-slate-200 p-12 text-center">

            <div
              className="w-10 h-10 border-4
                         border-blue-600
                         border-t-transparent
                         rounded-full animate-spin
                         mx-auto mb-4"
            />

            <p className="text-slate-500">
              Loading your projects...
            </p>

          </div>
        )}

        {/* ===================================================
            Empty State
        =================================================== */}

        {!loading && projects.length === 0 && (
          <div
            className="bg-white rounded-2xl border
                       border-dashed border-slate-300
                       p-12 text-center"
          >

            <div
              className="w-16 h-16 rounded-2xl
                         bg-blue-50
                         flex items-center justify-center
                         mx-auto mb-5"
            >
              <FolderKanban
                size={30}
                className="text-blue-600"
              />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              No projects yet
            </h3>

            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Add your academic, personal, internship, or
              major projects to strengthen your Placentra AI profile.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-6 inline-flex items-center gap-2
                         px-6 py-3 rounded-xl
                         bg-blue-600 text-white
                         font-semibold
                         hover:bg-blue-700
                         transition"
            >
              <Plus size={18} />
              Add Your First Project
            </button>

          </div>
        )}

        {/* ===================================================
            Project Cards
        =================================================== */}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2
                          gap-6">

            {projects.map((project) => (

              <article
                key={project.id}
                className="group bg-white rounded-2xl
                           border border-slate-200
                           shadow-sm
                           hover:shadow-lg
                           hover:-translate-y-1
                           transition-all duration-300
                           overflow-hidden"
              >

                {/* Card Top */}

                <div className="p-6">

                  <div className="flex items-start
                                  justify-between gap-4">

                    <div className="flex items-start gap-4">

                      <div
                        className="w-12 h-12 shrink-0
                                   rounded-xl
                                   bg-blue-50
                                   flex items-center
                                   justify-center"
                      >
                        <FolderKanban
                          size={23}
                          className="text-blue-600"
                        />
                      </div>

                      <div>

                        <h3
                          className="text-lg font-bold
                                     text-slate-900
                                     group-hover:text-blue-600
                                     transition"
                        >
                          {project.project_name}
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          Project #{project.id}
                        </p>

                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex gap-1">

                      <button
                        onClick={() => startEditing(project)}
                        title="Edit project"
                        className="p-2 rounded-lg
                                   text-slate-500
                                   hover:text-blue-600
                                   hover:bg-blue-50
                                   transition"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          deleteProject(project.id)
                        }
                        disabled={deletingId === project.id}
                        title="Delete project"
                        className="p-2 rounded-lg
                                   text-slate-500
                                   hover:text-red-600
                                   hover:bg-red-50
                                   disabled:opacity-50
                                   transition"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                  {/* Description */}

                  <p
                    className="text-sm text-slate-600
                               leading-6 mt-5
                               min-h-[72px]"
                  >
                    {project.description ||
                      "No description provided."}
                  </p>

                  {/* Technologies */}

                  <div className="flex flex-wrap gap-2 mt-5">

                    {(project.technologies || "")
                      .split(",")
                      .filter((tech) => tech.trim() !== "")
                      .map((tech, index) => (

                        <span
                          key={`${project.id}-${index}`}
                          className="px-3 py-1.5 rounded-full
                                     bg-blue-50
                                     text-blue-700
                                     text-xs
                                     font-semibold"
                        >
                          {tech.trim()}
                        </span>

                      ))}

                  </div>

                </div>

                {/* Card Footer */}

                <div
                  className="border-t border-slate-100
                             px-6 py-4
                             bg-slate-50/70
                             flex items-center
                             justify-between"
                >

                  {project.github_link ? (
                    <a
                      href={project.github_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center
                                 gap-2
                                 text-sm
                                 font-semibold
                                 text-slate-700
                                 hover:text-blue-600
                                 transition"
                    >
                      <Github size={17} />
                      GitHub
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span
                      className="text-sm text-slate-400"
                    >
                      No GitHub repository
                    </span>
                  )}

                  <span
                    className="text-xs font-medium
                               text-slate-400"
                  >
                    Placement Portfolio
                  </span>

                </div>

              </article>

            ))}

          </div>
        )}

      <ContinueStep to="/skills" label="Continue to Skills" />
      </main>
    </div>
  );
}


/* =========================================================
   Statistics Card
========================================================= */

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl
                 border border-slate-200
                 shadow-sm p-5
                 hover:shadow-md
                 transition"
    >

      <div className="flex items-center gap-4">

        <div
          className="w-11 h-11 rounded-xl
                     bg-blue-50
                     flex items-center justify-center
                     text-blue-600"
        >
          {icon}
        </div>

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}