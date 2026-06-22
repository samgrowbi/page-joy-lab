import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FormField {
  id: number;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface IntakeForm {
  id: number;
  name: string;
  fields: FormField[];
}

interface IntakeFormFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Check if this is the promotional appointment policy field
const isPolicyField = (fieldName: string, fieldId?: number): boolean => {
  // Match by specific field ID from Acuity (17961508 is "I have read and agree to the terms above")
  if (fieldId === 17961508) return true;
  
  const lowerName = fieldName.toLowerCase();
  return (
    (lowerName.includes("promotional") && lowerName.includes("policy")) ||
    (lowerName.includes("read") && lowerName.includes("agree") && lowerName.includes("terms"))
  );
};

export function IntakeFormField({ field, value, onChange, disabled }: IntakeFormFieldProps) {
  const renderPolicyField = () => {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Promotional Appointment Policy {field.required && "*"}
        </Label>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Please review our cancellation policy for promotional appointments:
          </p>
          
          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm">
                Promotional appointments can only be <strong>rescheduled once</strong>.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm">
                Rescheduling must be done at least <strong>24 hours in advance</strong> of the original appointment time.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm">
                No-shows or late cancellations will result in <strong>promotional offer expiring</strong> and you won't be eligible to redeem it.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 pt-1">
          <Checkbox
            id={`field-${field.id}`}
            checked={value === "yes" || value === "true"}
            onCheckedChange={(checked) => onChange(checked ? "yes" : "")}
            disabled={disabled}
            className="mt-0.5"
          />
          <label
            htmlFor={`field-${field.id}`}
            className="text-sm leading-relaxed cursor-pointer"
          >
            I have read and agree to the promotional appointment policy above.
          </label>
        </div>
      </div>
    );
  };

  const renderField = () => {
    // Special handling for promotional policy field
    if ((field.type === "checkbox" || field.type === "yesno") && isPolicyField(field.name, field.id)) {
      return renderPolicyField();
    }

    switch (field.type) {
      case "textbox":
        return (
          <Input
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.name}
            disabled={disabled}
            className="focus:ring-pink-500 focus:border-pink-500"
          />
        );

      case "textarea":
        return (
          <Textarea
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.name}
            disabled={disabled}
            className="focus:ring-pink-500 focus:border-pink-500 min-h-[80px]"
          />
        );

      case "dropdown":
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
      case "yesno":
        return (
          <div className="flex items-center space-x-3">
            <Checkbox
              id={`field-${field.id}`}
              checked={value === "yes" || value === "true"}
              onCheckedChange={(checked) => onChange(checked ? "yes" : "")}
              disabled={disabled}
            />
            <label
              htmlFor={`field-${field.id}`}
              className="text-sm leading-none cursor-pointer"
            >
              {field.name}
            </label>
          </div>
        );

      case "checkboxlist":
        const selectedValues = value ? value.split(",").map((v) => v.trim()) : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={`field-${field.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    onChange(newValues.join(", "));
                  }}
                  disabled={disabled}
                />
                <label
                  htmlFor={`field-${field.id}-${option}`}
                  className="text-sm leading-none cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            id={`field-${field.id}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.name}
            disabled={disabled}
            className="focus:ring-pink-500 focus:border-pink-500"
          />
        );
    }
  };

  const isCheckboxType = field.type === "checkbox" || field.type === "yesno";
  const isPolicyCheckbox = isCheckboxType && isPolicyField(field.name, field.id);

  return (
    <div className="space-y-2">
      {!isCheckboxType && (
        <Label htmlFor={`field-${field.id}`}>
          {field.name} {field.required && "*"}
        </Label>
      )}
      {renderField()}
    </div>
  );
}
