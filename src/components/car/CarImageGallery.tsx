
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CarImageGalleryProps {
  image: string;
  images?: string[];
  name: string;
}

const CarImageGallery = ({ image, images, name }: CarImageGalleryProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();
  
  // Use the images array if available, otherwise create one with just the main image
  const allImages = images && images.length > 0 ? images : [image];
  
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };
  
  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  const selectThumbnail = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  return (
    <div className="p-4 sm:p-6">
      {isMobile ? (
        <div className="relative">
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogTrigger asChild>
              <div className="relative cursor-pointer">
                <img
                  src={allImages[0]}
                  alt={`${name} - головне фото`}
                  className="w-full h-[300px] object-cover rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2">
                  <Image className="w-6 h-6" />
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">1 / {allImages.length}</span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 sm:max-w-4xl">
              <div className="relative h-full w-full flex flex-col bg-black/90">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-50 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 z-10 text-white hover:text-white hover:bg-white/20 h-10 w-10"
                    onClick={goToPrevImage}
                    disabled={allImages.length <= 1}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${name} - фото ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 z-10 text-white hover:text-white hover:bg-white/20 h-10 w-10"
                    onClick={goToNextImage}
                    disabled={allImages.length <= 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex overflow-x-auto py-3 px-4 bg-black/80 gap-2 h-24">
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`h-full aspect-square flex-shrink-0 cursor-pointer transition-all ${
                          idx === currentImageIndex ? 'border-2 border-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => selectThumbnail(idx)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="absolute bottom-28 left-4 bg-white/80 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">{currentImageIndex + 1} / {allImages.length}</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div>
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <div className="grid grid-cols-1 gap-4">
              <DialogTrigger asChild>
                <img
                  src={allImages[0]}
                  alt={name}
                  className="w-full h-96 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                />
              </DialogTrigger>
              
              {allImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {allImages.slice(0, 6).map((img, idx) => (
                    <DialogTrigger key={idx} asChild>
                      <img
                        src={img}
                        alt={`${name} - фото ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                        onClick={() => setCurrentImageIndex(idx)}
                      />
                    </DialogTrigger>
                  ))}
                </div>
              )}
            </div>
            
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 sm:max-w-4xl">
              <div className="relative h-full w-full flex flex-col bg-black/90">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-50 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 z-10 text-white hover:text-white hover:bg-white/20 h-10 w-10"
                    onClick={goToPrevImage}
                    disabled={allImages.length <= 1}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`${name} - фото ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 z-10 text-white hover:text-white hover:bg-white/20 h-10 w-10"
                    onClick={goToNextImage}
                    disabled={allImages.length <= 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex overflow-x-auto py-3 px-4 bg-black/80 gap-2 h-24">
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`h-full aspect-square flex-shrink-0 cursor-pointer transition-all ${
                          idx === currentImageIndex ? 'border-2 border-white' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => selectThumbnail(idx)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="absolute bottom-28 left-4 bg-white/80 rounded-full px-3 py-1">
                  <span className="text-sm font-medium">{currentImageIndex + 1} / {allImages.length}</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
