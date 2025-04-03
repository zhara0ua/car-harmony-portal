
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGallery } from "./gallery/useGallery";
import GalleryFullscreenView from "./gallery/GalleryFullscreenView";
import MobileGalleryPreview from "./gallery/MobileGalleryPreview";
import DesktopGalleryGrid from "./gallery/DesktopGalleryGrid";

interface CarImageGalleryProps {
  image: string;
  images?: string[];
  name: string;
}

const CarImageGallery = ({ image, images, name }: CarImageGalleryProps) => {
  const isMobile = useIsMobile();
  const { 
    allImages,
    isGalleryOpen,
    currentImageIndex,
    setCurrentImageIndex,
    openGallery,
    closeGallery
  } = useGallery(image, images);
  
  return (
    <div className="p-4 sm:p-6">
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        {isMobile ? (
          <GalleryFullscreenView
            images={allImages}
            name={name}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            onClose={closeGallery}
          >
            <MobileGalleryPreview 
              image={allImages[0]} 
              totalImages={allImages.length}
              name={name}
            />
          </GalleryFullscreenView>
        ) : (
          <GalleryFullscreenView
            images={allImages}
            name={name}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            onClose={closeGallery}
          >
            <DesktopGalleryGrid
              mainImage={allImages[0]}
              thumbnails={allImages.slice(1)}
              name={name}
              onImageClick={openGallery}
            />
          </GalleryFullscreenView>
        )}
      </Dialog>
    </div>
  );
};

export default CarImageGallery;
