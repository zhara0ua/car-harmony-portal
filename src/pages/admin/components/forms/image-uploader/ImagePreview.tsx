
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ImageIcon, X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  index: number;
  isMain: boolean;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
}

export const ImagePreview = ({ src, index, isMain, onRemove, onSetMain }: ImagePreviewProps) => {
  return (
    <div 
      className={`relative rounded-md overflow-hidden border-2 ${
        isMain ? "border-primary" : "border-gray-200"
      }`}
    >
      <img 
        src={src} 
        alt={`Preview ${index + 1}`} 
        className="w-full h-32 object-cover"
        onError={(e) => {
          console.error(`Error loading image at index ${index}:`, src);
          (e.target as HTMLImageElement).src = "/placeholder.svg";
        }}
      />
      
      <div className="absolute top-1 right-1 flex space-x-1">
        {isMain ? (
          <Button
            type="button"
            size="icon"
            variant="default"
            className="h-6 w-6"
          >
            <Check className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-6 w-6 bg-white"
            onClick={() => onSetMain(index)}
          >
            <ImageIcon className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-6 w-6"
          onClick={() => onRemove(index)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {isMain && (
        <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-xs py-1 text-center">
          Головне фото
        </div>
      )}
    </div>
  );
};
