import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/primitives/avatar";
import { User } from "lucide-react";

interface ProfileImageProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function ProfileImage({
  src,
  alt = "Profile",
  size = "md",
  fallback,
  className = "",
}: ProfileImageProps) {
  // Generate initials from fallback text
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback className="bg-neutral-700 text-white">
        {fallback ? getInitials(fallback) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
