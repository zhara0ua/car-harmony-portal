
import React from "react";
import { Image } from "lucide-react";

interface MobileGalleryPreviewProps {
  image: string;
  totalImages: number;
  name: string;
}

const MobileGalleryPreview: React.FC<MobileGalleryPreviewProps> = ({
  image,
  totalImages,
  name
}) => {
  return (
    <div className="relative cursor-pointer">
      <img
        src={image}
        alt={`${name} - головне фото`}
        className="w-full h-[300px] object-cover rounded-lg"
      />
      <div className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2">
        <Image className="w-6 h-6" />
      </div>
      <div className="absolute bottom-4 left-4 bg-white/90 rounded-full px-3 py-1">
        <span className="text-sm font-medium">1 / {totalImages}</span>
      </div>
    </div>
  );
};

export default MobileGalleryPreview;
