import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { BRANCH_OPTIONS } from "../config/branches";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    branch: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/signup",
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
        navigate("/login", {
          state: { message: "Account created successfully. Please log in to continue." },
        });
      } else {
        setError(data.message || "Unable to create account.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h1 className="text-center text-3xl font-bold text-gradient">
            Placentra AI
          </h1>

          <p className="mt-2 mb-8 text-center text-ink-500 dark:text-ink-400">
            Create your Placentra AI account
          </p>
          {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <form onSubmit={handleSubmit}>
            <h3 className="mb-4 text-lg font-semibold">
              Personal Information
            </h3>

            <Input
  label="Full Name"
  name="fullName"
  type="text"
  placeholder="Enter your full name"
  value={form.fullName}
  onChange={handleChange}
  required
/>

            <br />
            <br />

            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <h3 className="mb-4 mt-6 text-lg font-semibold">
              Academic Information
            </h3>

            <Input
              type="text"
              name="college"
              label="College Name (Optional)"
              placeholder="College Name (Optional)"
              value={form.college}
              onChange={handleChange}
            />

            <br />
            <br />

            <select
              className="input-base"
              name="degree"
              value={form.degree}
              onChange={handleChange}
              required
            >
              <option value="">Select Degree</option>
              <option value="B.E.">B.E.</option>
              <option value="B.Tech.">B.Tech.</option>
              <option value="MCA">MCA</option>
              <option value="M.Tech.">M.Tech.</option>
            </select>

            <br />
            <br />

            <select
              className="input-base"
              name="branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="">Select Branch</option>
              {BRANCH_OPTIONS.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            <br />
            <br />

            <select
              className="input-base"
              name="year"
              value={form.year}
              onChange={handleChange}
              required
            >
              <option value="">Current Year</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Final Year">Final Year</option>
            </select>

            <br />
            <br />

            <Button
  type="submit"
  className="w-full"
  loading={loading}
>
  Create Account
</Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-ink-500">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="ml-2 font-semibold text-brand-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}