import { useEffect, useRef } from "react";
import { DEFAULT_ACUITY_APPOINTMENT_TYPE_ID } from "@/config/acuity";

// Acuity owner slug (from schedule URL)
const ACUITY_OWNER_SLUG = "33845218";

interface AcuityEmbedProps {
  className?: string;
  appointmentTypeId?: string;
}

export function AcuityEmbed({ 
  className = "", 
  appointmentTypeId = DEFAULT_ACUITY_APPOINTMENT_TYPE_ID 
}: AcuityEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Acuity embed script
    const script = document.createElement("script");
    script.src = "https://embed.acuityscheduling.com/js/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://embed.acuityscheduling.com/js/embed.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const embedUrl = `https://app.acuityscheduling.com/schedule.php?owner=${ACUITY_OWNER_SLUG}&appointmentType=${appointmentTypeId}`;

  return (
    <div ref={containerRef} className={className}>
      <iframe
        src={embedUrl}
        title="Schedule Appointment"
        width="100%"
        height="800"
        frameBorder="0"
        className="rounded-lg"
        style={{ minHeight: "600px" }}
      />
    </div>
  );
}
