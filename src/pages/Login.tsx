import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
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

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to log in. Please check your details.");
      }
      const data = await response.json();

      if (data.success) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        const userId = data.user.id;
        const dashboardResponse = await fetch(`http://127.0.0.1:5000/dashboard/${userId}`);
        if (!dashboardResponse.ok) {
          throw new Error("Unable to load your onboarding progress.");
        }
        const dashboardData = await dashboardResponse.json();
        if (!dashboardData.success) {
          throw new Error(dashboardData.message || "Unable to load your onboarding progress.");
        }
        const summary = dashboardData.summary || {};
        const progress = JSON.parse(localStorage.getItem(`placementai-onboarding-${userId}`) || "{}") as Record<string, boolean>;
        const hasCompletedJourney = progress.Plan || (
          !Object.keys(progress).length &&
          summary.profile_completion >= 100 &&
          summary.projects > 0 &&
          summary.skills > 0
        );
        const next = hasCompletedJourney
          ? "/dashboard"
          : summary.profile_completion < 80
          ? "/profile"
          : summary.projects === 0
            ? "/projects"
            : summary.skills === 0
              ? "/skills"
              : Object.keys(progress).length && !progress.Internships && !progress.Certifications
                ? "/internships"
                : "/dashboard";
        navigate(next);
      } else {
        alert(data.message || "Unable to log in.");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex items-center justify-center px-4">

      <Card className="w-full max-w-md">

        <CardContent>

          <h1 className="text-center text-3xl font-bold text-gradient">
            Placentra AI
          </h1>

          {location.state?.message && (
            <p className="mb-4 text-center text-sm font-medium text-green-600">{location.state.message}</p>
          )}
          <p className="mt-2 mb-8 text-center text-ink-500 dark:text-ink-400">
            Welcome Back
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button
  type="submit"
  loading={loading}
  className="w-full"
>
  Login
</Button>

</form>

<div className="mt-6 text-center">

  <span className="text-sm text-ink-500 dark:text-ink-400">
    Don't have an account?
  </span>

  <Link
    to="/signup"
    className="ml-2 font-semibold text-brand-600 hover:underline"
  >
    Create One
  </Link>

</div>

</CardContent>

</Card>

</div>

  );
}