import { cn } from "@/lib/utils";
import React from "react";

export const KaabaIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("lucide lucide-mosque", className)}
    {...props}
  >
    <path d="M2 12v8h20v-8" />
    <path d="M3.3 12H2v-2.2c0-.9.5-1.7 1.3-2.1L12 2l8.7 5.7c.8.4 1.3 1.2 1.3 2.1V12h-1.3" />
    <path d="M12 22V8" />
    <path d="M8.5 12v-2a3.5 3.5 0 1 1 7 0v2" />
    <path d="M12 8s-5.7-3-7-3" />
    <path d="M12 8s5.7-3 7-3" />
    <path d="M4 22V10" />
    <path d="M20 22V10" />
  </svg>
);
