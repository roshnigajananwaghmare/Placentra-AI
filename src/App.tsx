import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Internships from "./pages/Internships";
import Certifications from "./pages/Certifications";
import Resume from "./pages/Resume";
import PlacementPredictor from "./pages/PlacementPredictor";
import CareerRecommendation from "./pages/CareerRecommendation";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import ImprovementPlan from "./pages/ImprovementPlan";

function Protected({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hasUser = Boolean(localStorage.getItem("user"));
  return hasUser ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route
  path="/projects"
  element={<Protected><Projects /></Protected>}
/>
<Route path="/skills" element={<Protected><Skills /></Protected>} />
<Route
  path="/internships"
  element={<Protected><Internships /></Protected>}
/>
<Route
  path="/certifications"
  element={<Protected><Certifications /></Protected>}
/>
<Route
    path="/resume"
    element={<Protected><Resume /></Protected>}
/>
<Route
    path="/placement-predictor"
    element={<Protected><PlacementPredictor /></Protected>}
/>
<Route
    path="/career-recommendation"
    element={<Protected><CareerRecommendation /></Protected>}
/>
<Route
    path="/skill-gap-analysis"
    element={<Protected><SkillGapAnalysis /></Protected>}
/>
<Route
    path="/improvement-plan"
    element={<Protected><ImprovementPlan /></Protected>}
/>
    </Routes>
    
    
  );
}


export default App;