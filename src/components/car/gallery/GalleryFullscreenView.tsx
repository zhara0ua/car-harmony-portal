
import React from "react";
import { 
  DialogContent, 
  DialogPortal,
  DialogOverlay 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import GalleryNavigationButton from "./GalleryNavigationButton";
import GalleryCounter from "./GalleryCounter";

interface GalleryFullscreenViewProps {
  images: string[];
  name: string;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  onClose: () => void;
  children: React.ReactNode;
}

const GalleryFullscreenView = ({
  images,
  name,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  children
}: GalleryFullscreenViewProps) => {
  const handlePrevious = () => {
    setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  return (
    <>
      {children}
      
      <DialogPortal>
        <DialogOverlay className="bg-black/95 backdrop-blur-sm" />
        <DialogContent className="border-none bg-transparent shadow-none max-w-7xl h-screen flex flex-col justify-center px-4 sm:px-6">
          <div className="absolute top-4 right-4 flex space-x-2">
            <GalleryCounter 
              current={currentImageIndex + 1} 
              total={images.length} 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/20 border border-white/10 backdrop-blur-sm text-white hover:text-white hover:bg-black/30"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="w-full h-[300px] sm:h-[500px] md:h-[700px] relative flex justify-center items-center">
            <img 
              src={images[currentImageIndex]} 
              alt={`${name} - zdjęcie ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            
            <GalleryNavigationButton 
              direction="prev" 
              onClick={handlePrevious}
            />
            
            <GalleryNavigationButton 
              direction="next" 
              onClick={handleNext}
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </>
  );
};

export default GalleryFullscreenView;
