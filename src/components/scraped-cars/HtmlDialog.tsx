
import { Code, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface HtmlDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string | null;
  onAnalyzeStructure?: (html: string) => void;
}

export const HtmlDialog = ({ 
  isOpen, 
  onOpenChange, 
  htmlContent, 
  onAnalyzeStructure 
}: HtmlDialogProps) => {
  const handleAnalyze = () => {
    if (htmlContent && onAnalyzeStructure) {
      onAnalyzeStructure(htmlContent);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            OpenLane HTML код
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="flex-1 min-h-0 my-4">
          <ScrollArea className="h-[70vh] border rounded-md p-4 bg-muted/50">
            {htmlContent ? (
              <div className="prose prose-sm max-w-none">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {htmlContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                HTML вміст з OpenLane недоступний
              </div>
            )}
          </ScrollArea>
        </div>
        
        <AlertDialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={handleAnalyze}
              disabled={!htmlContent}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Аналізувати структуру
            </Button>
          </div>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Закрити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
