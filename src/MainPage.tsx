import { Routes, Route } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import LoginPage from "@/LoginPage";
import RegisterPage from "@/RegisterPage";
import ContactForm from "@/components/contact-form";

function MainPage() {
  return (
    <Routes>
      <Route path="/" element={<HeroSection />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/contact" element={<ContactForm />} />
    </Routes>
  );
}

export default MainPage;