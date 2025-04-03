
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlUploadTabProps {
  onUrlSubmit: (url: string) => void;
}

export const UrlUploadTab = ({ onUrlSubmit }: UrlUploadTabProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl && imageUrl.trim() !== "" && imageUrl.startsWith("http")) {
      onUrlSubmit(imageUrl);
      setImageUrl("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <div className="flex-1">
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <Button type="submit">Додати</Button>
      <p className="text-sm text-gray-500 mt-1">
        Вставте URL-адресу зображення
      </p>
    </form>
  );
};
