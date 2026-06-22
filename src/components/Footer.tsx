import { Facebook, Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";
import lumiereLogoWhite from "@/assets/glo-logo.jpg";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BUSINESS_ADDRESS_LINES,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  BUSINESS_EMAIL,
  SOCIAL_INSTAGRAM,
  SOCIAL_FACEBOOK,
  GOOGLE_MAPS_LINK,
  BUSINESS_HOURS,
} from "@/config/brand";
import { Events, track } from "@/lib/analytics";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-8 pb-6" dir="ltr">
      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 items-start">
          {/* Brand Section */}
          <div className="-mt-[25px]">
            <a href="#" className="block">
              <img
                src={lumiereLogoWhite}
                alt={BRAND_NAME}
                loading="lazy"
                decoding="async"
                className="h-[63px] w-auto rounded"
              />
            </a>
            <p className="text-gray-400 text-base lg:text-lg xl:text-xl mb-8">{BRAND_TAGLINE}</p>
            <div>
              <p className="text-sm lg:text-base xl:text-lg text-gray-500 mb-3 uppercase tracking-wider">Follow Us</p>
              <div className="flex gap-3">
                <a
                  href={SOCIAL_INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 hover:scale-110 transition-all duration-300"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={SOCIAL_FACEBOOK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 hover:scale-110 transition-all duration-300"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links & Business Hours */}
          <div className="grid grid-cols-2 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg lg:text-2xl font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-base lg:text-lg xl:text-xl">
                <li><a href="#hero" className="text-gray-400 hover:text-pink-400 transition-colors">Home</a></li>
                <li><a href="#results" className="text-gray-400 hover:text-pink-400 transition-colors">Results</a></li>
                <li><a href="#technology" className="text-gray-400 hover:text-pink-400 transition-colors">Technology</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-pink-400 transition-colors">About</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-pink-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Business Hours */}
            <div>
              <h4 className="text-lg lg:text-2xl font-semibold mb-6">Business Hours</h4>
              <ul className="space-y-3 text-base lg:text-lg xl:text-xl">
                {BUSINESS_HOURS.map((row) => (
                  <li key={row.days} className="flex items-start gap-3 text-gray-400">
                    <Clock size={20} className="shrink-0 mt-0.5 hidden sm:block" />
                    <div>
                      <p className="text-white">{row.days}</p>
                      <p>{row.hours}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg lg:text-2xl font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-base lg:text-lg xl:text-xl">
              <li>
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-pink-400 transition-colors group"
                >
                  <MapPin size={20} className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>
                    {BUSINESS_ADDRESS_LINES.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < BUSINESS_ADDRESS_LINES.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS_PHONE_TEL}`}
                  onClick={() => track(Events.PhoneClicked, { source: "footer" })}
                  className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors group"
                >
                  <Phone size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{BUSINESS_PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  onClick={() => track(Events.EmailClicked, { source: "footer" })}
                  className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors group"
                >
                  <Mail size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{BUSINESS_EMAIL}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8"></div>

        {/* Copyright & Legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm lg:text-base xl:text-lg">
          <p>© {currentYear} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
