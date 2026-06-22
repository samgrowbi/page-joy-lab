import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "relative overflow-hidden bg-pink-500 hover:bg-pink-600 text-white shadow-[0_8px_24px_-8px_rgba(236,72,153,0.55)] hover:shadow-[0_12px_36px_-6px_rgba(236,72,153,0.7)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-1/3 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-shimmer-sweep before:pointer-events-none motion-reduce:before:hidden motion-reduce:hover:scale-100 motion-reduce:hover:translate-y-0",
        ctaOutline: "border-2 border-pink-500 text-pink-500 hover:bg-pink-50 transition-all hover:scale-105 bg-transparent",
        ctaInverted: "bg-white text-pink-500 hover:bg-white/90 shadow-lg transition-all hover:scale-105",
      },
      size: {
        default: "px-8 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        cta: "px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
