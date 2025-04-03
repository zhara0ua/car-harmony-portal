
import { useState } from "react";

export const useGallery = (mainImage: string, images?: string[]) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use the images array if available, otherwise create one with just the main image
  const allImages = images && images.length > 0 ? images : [mainImage];
  
  const openGallery = (index: number = 0) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };
  
  const closeGallery = () => {
    setIsGalleryOpen(false);
  };
  
  return {
    allImages,
    isGalleryOpen,
    currentImageIndex,
    setCurrentImageIndex,
    openGallery,
    closeGallery
  };
};
