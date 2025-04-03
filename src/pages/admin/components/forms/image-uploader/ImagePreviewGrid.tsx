
import { ImagePreview } from "./ImagePreview";
import { Label } from "@/components/ui/label";

interface ImagePreviewGridProps {
  imagePreviews: string[];
  mainImageIndex: number;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
}

export const ImagePreviewGrid = ({ 
  imagePreviews, 
  mainImageIndex, 
  onRemove, 
  onSetMain 
}: ImagePreviewGridProps) => {
  if (imagePreviews.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <Label>Попередній перегляд зображень</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        {imagePreviews.map((preview, index) => (
          <ImagePreview
            key={index}
            src={preview}
            index={index}
            isMain={index === mainImageIndex}
            onRemove={onRemove}
            onSetMain={onSetMain}
          />
        ))}
      </div>
    </div>
  );
};
