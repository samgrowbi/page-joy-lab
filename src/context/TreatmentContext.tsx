import { createContext, useContext } from "react";
import { TreatmentConfig, LED_TREATMENT } from "@/config/treatments";

const TreatmentContext = createContext<TreatmentConfig>(LED_TREATMENT);

export const TreatmentProvider = ({
  treatment,
  children,
}: {
  treatment: TreatmentConfig;
  children: React.ReactNode;
}) => (
  <TreatmentContext.Provider value={treatment}>
    {children}
  </TreatmentContext.Provider>
);

export const useTreatment = () => useContext(TreatmentContext);
