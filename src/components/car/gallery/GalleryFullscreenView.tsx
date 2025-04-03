
import React from "react";
import {
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import GalleryNavigationButton from "./GalleryNavigationButton";
import GalleryThumbnail from "./GalleryThumbnail";
import GalleryCounter from "./GalleryCounter";

interface GalleryFullscreenViewProps {
  images: string[];
  name: string;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const GalleryFullscreenView: React.FC<GalleryFullscreenViewProps> = ({
  images,
  name,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  children
}) => {
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 sm:max-w-4xl">
        <div className="relative h-full w-full flex flex-col bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-50 text-white hover:text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative flex items-center justify-center">
            <GalleryNavigationButton 
              direction="prev"
              onClick={goToPrevImage}
              disabled={images.length <= 1} 
            />
            
            <img
              src={images[currentImageIndex]}
              alt={`${name} - фото ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain p-4"
            />
            
            <GalleryNavigationButton 
              direction="next"
              onClick={goToNextImage}
              disabled={images.length <= 1} 
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex overflow-x-auto py-3 px-4 bg-black/80 gap-2 h-24">
              {images.map((img, idx) => (
                <GalleryThumbnail
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  isSelected={idx === currentImageIndex}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
          
          <GalleryCounter 
            current={currentImageIndex} 
            total={images.length} 
          />
        </div>
      </DialogContent>
    </>
  );
};

export default GalleryFullscreenView;
