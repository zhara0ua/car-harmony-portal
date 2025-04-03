
import React from "react";

interface DesktopGalleryGridProps {
  mainImage: string;
  thumbnails: string[];
  name: string;
  onImageClick: (index: number) => void;
}

const DesktopGalleryGrid: React.FC<DesktopGalleryGridProps> = ({
  mainImage,
  thumbnails,
  name,
  onImageClick
}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <img
        src={mainImage}
        alt={name}
        className="w-full h-96 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        onClick={() => onImageClick(0)}
      />
      
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-6 gap-2">
          {thumbnails.slice(0, 6).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${name} - фото ${idx + 1}`}
              className="w-full h-24 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => onImageClick(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DesktopGalleryGrid;
