import { Routes, Route } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import LoginPage from "@/LoginPage";
import RegisterPage from "@/RegisterPage";
import DashboardPage from "@/DashbordPage";

function MainPage() {
  return (
    <Routes>
      <Route path="/" element={<HeroSection />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default MainPage;