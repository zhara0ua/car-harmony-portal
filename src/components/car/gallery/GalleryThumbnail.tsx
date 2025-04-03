
import React from "react";

interface GalleryThumbnailProps {
  src: string;
  alt: string;
  isSelected: boolean;
  onClick: () => void;
}

const GalleryThumbnail: React.FC<GalleryThumbnailProps> = ({ 
  src, 
  alt, 
  isSelected, 
  onClick 
}) => {
  return (
    <div 
      className={`h-full aspect-square flex-shrink-0 cursor-pointer transition-all ${
        isSelected ? 'border-2 border-white' : 'opacity-70 hover:opacity-100'
      }`}
      onClick={onClick}
    >
      <img 
        src={src} 
        alt={alt}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default GalleryThumbnail;
