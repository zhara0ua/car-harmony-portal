
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Image } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CarImageGalleryProps {
  image: string;
  name: string;
}

const CarImageGallery = ({ image, name }: CarImageGalleryProps) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="p-4 sm:p-6">
      {isMobile ? (
        <div className="relative">
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogTrigger asChild>
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
                  <span className="text-sm font-medium">1 / 1</span>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 sm:max-w-4xl">
              <div className="relative h-full w-full flex items-center justify-center bg-black/90">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-50 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={image}
                  alt={name}
                  className="max-h-full max-w-full object-contain p-4"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogTrigger asChild>
              <img
                src={image}
                alt={name}
                className="w-full h-96 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] h-[90vh] p-0 sm:max-w-4xl">
              <div className="relative h-full w-full flex items-center justify-center bg-black/90">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 z-50 text-white hover:text-white hover:bg-white/20"
                  onClick={() => setIsGalleryOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <img
                  src={image}
                  alt={name}
                  className="max-h-full max-w-full object-contain p-4"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
