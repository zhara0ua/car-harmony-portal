
import React from "react";

interface GalleryCounterProps {
  current: number;
  total: number;
}

const GalleryCounter: React.FC<GalleryCounterProps> = ({ current, total }) => {
  return (
    <div className="absolute bottom-28 left-4 bg-white/80 rounded-full px-3 py-1">
      <span className="text-sm font-medium">{current + 1} / {total}</span>
    </div>
  );
};

export default GalleryCounter;
