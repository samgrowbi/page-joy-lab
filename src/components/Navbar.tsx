import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import lumiereLogo from "@/assets/glo-logo.png";
import { BRAND_NAME } from "@/config/brand";

interface NavbarProps {
  onBookingClick: () => void;
}

export function Navbar({ onBookingClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "Results", href: "#results" },
    { name: "Technology", href: "#technology" },
    { name: "About", href: "#about" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      dir="ltr"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm ${
        isScrolled ? "py-1 md:py-0" : "py-2 md:py-0"
      }`}
    >
      <div className="container mx-auto px-5 flex justify-between items-center">
        <a href="#" className="block">
          <img 
            src={lumiereLogo} 
            alt={BRAND_NAME}
            className="h-[19px] w-auto md:h-[30px] m-[10px]" 
            fetchPriority="high" decoding="async"/>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base lg:text-lg xl:text-xl font-medium text-gray-700 hover:text-rose-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <Button
            variant="cta"
            size="cta"
            onClick={onBookingClick}
          >
            Book Now
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-rose-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden flex flex-col items-center py-8 gap-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-800 font-medium text-lg hover:text-rose-400"
            >
              {link.name}
            </a>
          ))}
          <Button
            variant="cta"
            size="cta"
            onClick={() => {
              onBookingClick();
              setIsMobileMenuOpen(false);
            }}
          >
            Book Now
          </Button>
        </motion.div>
      )}
    </nav>
  );
}
