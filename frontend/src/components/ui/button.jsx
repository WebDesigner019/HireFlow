import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-blue-700 hover:shadow-lift",
        success: "bg-success text-success-foreground shadow-sm hover:bg-green-700",
        warning: "bg-warning text-warning-foreground shadow-sm hover:bg-amber-500",
        danger: "bg-danger text-danger-foreground shadow-sm hover:bg-red-700",
        outline: "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        secondary: "bg-slate-900 text-white hover:bg-slate-800"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));

Button.displayName = "Button";
