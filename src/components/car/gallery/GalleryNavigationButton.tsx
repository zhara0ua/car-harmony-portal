
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryNavigationButtonProps {
  direction: "prev" | "next";
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

const GalleryNavigationButton: React.FC<GalleryNavigationButtonProps> = ({
  direction,
  onClick,
  disabled = false
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute z-10 text-white hover:text-white hover:bg-white/20 h-10 w-10"
      style={{
        [direction === "prev" ? "left" : "right"]: "2px"
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {direction === "prev" ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </Button>
  );
};

export default GalleryNavigationButton;
