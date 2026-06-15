import { cn } from "@/lib/utils";

export default function Logo({ className }) {
  return (
    <img
      src="/SRS.png"
      alt=""
      className={cn("h-auto w-60 object-contain", className)}
    />
  );
}