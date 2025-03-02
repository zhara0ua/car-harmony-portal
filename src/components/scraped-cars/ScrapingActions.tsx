
import { Code, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrapingActionsProps {
  onScrape: () => void;
  isScrapingInProgress: boolean;
  htmlContent: string | null;
  onShowHtml: () => void;
}

export const ScrapingActions = ({
  onScrape,
  isScrapingInProgress,
  htmlContent,
  onShowHtml
}: ScrapingActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onScrape}
        disabled={isScrapingInProgress}
        className="flex items-center gap-2"
      >
        {isScrapingInProgress ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Завантаження...</span>
          </>
        ) : (
          "Оновити дані"
        )}
      </Button>
      
      {htmlContent && (
        <Button 
          variant="secondary" 
          onClick={onShowHtml}
          className="flex items-center gap-2"
        >
          <Code className="h-4 w-4" />
          <span>Показати HTML</span>
        </Button>
      )}
    </div>
  );
};
