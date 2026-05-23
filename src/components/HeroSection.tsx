import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/image/image-call-center-workers-happy.png";
import logo from "@/assets/svg/logoipsum-423(1).svg";
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[#1c1c1c] flex flex-col font-[Barlow,sans-serif]">
      {/* HERO */}
      <div className="relative flex-1 min-h-[580px] overflow-hidden">

        {/* Zdjęcie w tle */}
        <img
          src={heroBg}
          alt="Call center team"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Ukośny ciemny overlay po lewej */}
        <div
          className="absolute inset-0 bg-black/55"
          style={{
            clipPath: "polygon(0 0, 68% 0, 50% 100%, 0 100%)",
            backdropFilter: "blur(2px)"
          }}
        />

        {/* NAVBAR - nad zdjęciem */}
        <nav className="relative z-20 flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#2a2a2a]/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 sm:gap-6">
            <img src={logo} alt="Logo" className="h-6 sm:h-8 w-auto" />
            <a
              href="tel:+48666666666"
              className="flex items-center gap-1.5 sm:gap-2 text-white/90 font-medium hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="hidden sm:inline text-sm sm:text-xl whitespace-nowrap">+48 666 666 666</span>
            </a>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 text-sm sm:text-xl px-3 sm:px-5 py-2 sm:py-5"
            >
              Contact
            </Button>
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 text-sm sm:text-xl px-3 sm:px-5 py-2 sm:py-5"
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </nav>

        {/* Tekst */}
        <div className="relative z-10 px-16 pt-14 pb-20 min-h-[580px] flex flex-col justify-center">
        <p className="text-white/85 text-sm sm:text-xl font-semibold tracking-wide mb-2">
          Getting leads
        </p>
        <h1 className="text-white font-extrabold leading-[1.05] text-3xl sm:text-7xl lg:text-8xl">
          done the
          <br />
          right way.
        </h1>
        </div>
      </div>
    </div>
  );
}
