import { Clock, Sparkles } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export interface TreatmentInfo {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: string;
  originalPrice: string;
  category: string;
  color: string;
  image: string;
}

interface TreatmentDetailsProps {
  treatment: TreatmentInfo | null;
  isLoading: boolean;
}

export function TreatmentDetails({ treatment, isLoading }: TreatmentDetailsProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-center gap-8">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!treatment) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Unable to load treatment details
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Image - larger and centered */}
      {treatment.image && (
        <div className="w-full max-w-[280px] mx-auto">
          <AspectRatio ratio={4/3} className="bg-muted rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={treatment.image} 
              alt={treatment.name}
              className="w-full h-full object-cover object-center"
             loading="lazy" decoding="async"/>
          </AspectRatio>
        </div>
      )}

      {/* Title + Category - centered */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-medium text-pink-600">
            {treatment.category || "Premium"}
          </span>
        </div>
        <h2 className="text-2xl font-serif text-foreground leading-tight">
          {treatment.name}
        </h2>
      </div>

      {/* Description */}
      <div className="text-center space-y-3">
        <p className="text-base text-muted-foreground leading-relaxed px-2">
          Achieve radiant, youthful skin without needles or surgery! Stimulates collagen & smooths fine lines.
        </p>
        <p className="text-sm font-medium text-green-600 bg-green-50 rounded-lg py-2 px-4 inline-block">
          ✨ No prepayment required
        </p>
      </div>

      {/* Duration & Price - larger */}
      <div className="flex items-center justify-center gap-8 py-4 bg-muted/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-base font-medium">{formatDuration(treatment.duration)}</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-base text-muted-foreground line-through">${treatment.originalPrice}</span>
          <span className="text-xl font-bold text-green-600">${treatment.price}</span>
        </div>
      </div>
    </div>
  );
}
