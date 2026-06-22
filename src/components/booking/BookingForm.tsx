import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookingFormData } from "@/hooks/useAcuityBooking";
import { IntakeFormField, IntakeForm } from "./IntakeFormField";
import { Loader2 } from "lucide-react";

interface BookingFormProps {
  formData: BookingFormData;
  onFormChange: (data: BookingFormData) => void;
  intakeForms: IntakeForm[];
  intakeFields: Record<number, string>;
  onIntakeFieldChange: (fieldId: number, value: string) => void;
  isLoadingForms: boolean;
  isSubmitting: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Normalize any pasted/autofilled value into a 10-digit US subscriber number.
// Strips +1 / leading 1 prefixes and non-digits, capped at 10.
const normalizeSubscriber = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
};

// Format a 10-digit subscriber number as "(555) 123-4567"
const formatSubscriber = (digits: string): string => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export function BookingForm({
  formData,
  onFormChange,
  intakeForms,
  intakeFields,
  onIntakeFieldChange,
  isLoadingForms,
  isSubmitting,
}: BookingFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof BookingFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value;

    if (field === "phone") {
      value = normalizeSubscriber(value);
    }

    onFormChange({
      ...formData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof BookingFormData) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof BookingFormData) => {
    const newErrors: FormErrors = { ...errors };

    switch (field) {
      case "firstName":
        if (!formData.firstName.trim()) {
          newErrors.firstName = "Please enter your first name";
        } else {
          delete newErrors.firstName;
        }
        break;
      case "lastName":
        if (!formData.lastName.trim()) {
          newErrors.lastName = "Please enter your last name";
        } else {
          delete newErrors.lastName;
        }
        break;
      case "email":
        if (!formData.email.trim()) {
          newErrors.email = "Please enter your email address";
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "phone": {
        const digits = formData.phone;
        if (!digits.trim()) {
          newErrors.phone = "Please enter your phone number";
        } else if (digits.startsWith("1")) {
          newErrors.phone = "Phone number cannot start with 1 after the country code.";
        } else if (digits.length < 10) {
          newErrors.phone = "Please enter a valid 10-digit phone number";
        } else {
          delete newErrors.phone;
        }
        break;
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
      <p className="text-sm text-muted-foreground text-center">
        Please enter your details to complete the booking
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              placeholder="Enter your first name"
              disabled={isSubmitting}
              autoComplete="given-name"
              className={`focus:ring-pink-500 focus:border-pink-500 ${
                touched.firstName && errors.firstName ? "border-red-500" : ""
              }`}
            />
            {touched.firstName && errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
              placeholder="Enter your last name"
              disabled={isSubmitting}
              autoComplete="family-name"
              className={`focus:ring-pink-500 focus:border-pink-500 ${
                touched.lastName && errors.lastName ? "border-red-500" : ""
              }`}
            />
            {touched.lastName && errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            placeholder="Enter your email address"
            disabled={isSubmitting}
            autoComplete="email"
            className={`focus:ring-pink-500 focus:border-pink-500 ${
              touched.email && errors.email ? "border-red-500" : ""
            }`}
          />
          {touched.email && errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <div
            className={`flex items-stretch rounded-md border bg-background focus-within:ring-1 focus-within:ring-pink-500 focus-within:border-pink-500 ${
              touched.phone && errors.phone ? "border-red-500" : "border-input"
            }`}
          >
            <span className="flex items-center px-3 text-sm text-muted-foreground border-r bg-gray-50 rounded-l-md select-none">
              +1
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formatSubscriber(formData.phone)}
              onChange={handleChange("phone")}
              onBlur={handleBlur("phone")}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
              autoComplete="tel-national"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none"
            />
          </div>
          {touched.phone && errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Intake Forms */}
      {isLoadingForms ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          <span className="ml-2 text-sm text-muted-foreground">Loading forms...</span>
        </div>
      ) : (
        intakeForms.map((form) => (
          <div key={form.id} className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm text-foreground mb-4">{form.name}</h4>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <IntakeFormField
                    key={field.id}
                    field={field}
                    value={intakeFields[field.id] || ""}
                    onChange={(value) => onIntakeFieldChange(field.id, value)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
