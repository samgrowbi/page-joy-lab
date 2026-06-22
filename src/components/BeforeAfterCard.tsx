import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface BeforeAfterCardProps {
  beforeImg: string;
  afterImg: string;
  label: string;
  name?: string;
  age?: number;
  className?: string;
}

export function BeforeAfterCard({ beforeImg, afterImg, label, name, age, className }: BeforeAfterCardProps) {
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const [open, setOpen] = useState(false);

  const FallbackPlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
      <span className="text-pink-400 text-sm font-medium">Image coming soon</span>
    </div>
  );

  const showBeforeFallback = beforeError || !beforeImg;
  const showAfterFallback = afterError || !afterImg;
  const canOpen = !showBeforeFallback && !showAfterFallback;

  return (
    <>
    <div className={cn("group", className)} dir="ltr">
        <button
          type="button"
          onClick={() => canOpen && setOpen(true)}
          aria-label={`Open before and after slider: ${label}`}
          className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-white transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-1 cursor-pointer text-left block"
        >
            <div className="flex w-full aspect-[4/3] lg:aspect-[16/9]">
                <div className="relative w-1/2 h-full overflow-hidden border-r border-white/20 bg-gray-100">
                    {showBeforeFallback ? (
                      <FallbackPlaceholder />
                    ) : (
                      <img
                          src={beforeImg}
                          alt="Before Treatment"
                          loading="lazy"
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                          onError={() => setBeforeError(true)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:bg-black/5" />
                </div>
                <div className="relative w-1/2 h-full overflow-hidden bg-gray-100">
                    {showAfterFallback ? (
                      <FallbackPlaceholder />
                    ) : (
                      <img
                          src={afterImg}
                          alt="After Treatment"
                          loading="lazy"
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                          onError={() => setAfterError(true)}
                      />
                    )}
                    {/* After 3 Sessions tag */}
                    {!showAfterFallback && (
                      <span className="absolute top-2 right-2 lg:top-3 lg:right-3 px-2 py-0.5 lg:px-2.5 lg:py-1 text-[10px] lg:text-xs font-semibold uppercase tracking-wide bg-white/95 text-pink-600 rounded shadow-sm">
                        After 3 Sessions
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
            </div>
            {/* Name & Age */}
            {name && (
              <div className="w-full text-center py-2 lg:py-3 bg-white">
                <span className="text-sm lg:text-lg xl:text-xl font-medium text-gray-800">{name}</span>
                {age && <span className="text-sm lg:text-lg xl:text-xl text-gray-500">, {age}</span>}
              </div>
            )}
            {/* Before/After Bar */}
            <div className="flex w-full text-center text-sm lg:text-lg xl:text-xl font-medium tracking-wide uppercase">
                <div className="w-1/2 py-2.5 lg:py-3.5 bg-gray-100 text-gray-500 border-r border-white transition-colors duration-300 group-hover:bg-gray-200">
                    Before
                </div>
                <div className="w-1/2 py-2.5 lg:py-3.5 bg-pink-500 text-white shadow-inner transition-colors duration-300 group-hover:bg-pink-600">
                    After
                </div>
            </div>
        </button>
    </div>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl p-0 bg-white overflow-hidden">
        <DialogTitle className="sr-only">{label} - Before and After Comparison</DialogTitle>
        {canOpen && <BeforeAfterSlider beforeImg={beforeImg} afterImg={afterImg} />}
        <div className="px-4 py-3 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{label}</span>
            {name && <> · {name}{age && `, ${age}`}</>}
          </p>
          <p className="text-xs text-gray-400 mt-1">Drag the handle to compare before and after</p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
