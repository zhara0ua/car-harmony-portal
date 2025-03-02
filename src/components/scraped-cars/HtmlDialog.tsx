
import { Code, Search, FileText, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  
  // Function to get basic stats about the HTML
  const getHtmlStats = () => {
    if (!htmlContent) return null;
    
    // Calculate some basic stats about the HTML
    const byteSize = new Blob([htmlContent]).size;
    const elementCount = (htmlContent.match(/<[a-z][\s\S]*?>/gi) || []).length;
    const hasImages = htmlContent.includes('<img');
    const hasScripts = htmlContent.includes('<script');
    const hasStylesheets = htmlContent.includes('<link rel="stylesheet"') || htmlContent.includes('<style');
    
    const timestamp = htmlContent.match(/timestamp.*?(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/i);
    
    return { 
      byteSize, 
      elementCount, 
      hasImages, 
      hasScripts, 
      hasStylesheets,
      timestamp: timestamp ? timestamp[1] : null
    };
  };
  
  const htmlStats = getHtmlStats();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            OpenLane HTML код (скрапер)
            {htmlStats && (
              <Badge variant="outline" className="ml-2">
                {(htmlStats.byteSize / 1024).toFixed(1)} KB
              </Badge>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            HTML код, який аналізує скрапер для пошуку елементів автомобілів
          </AlertDialogDescription>
          
          {htmlStats && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {htmlStats.elementCount} елементів
              </Badge>
              
              <Badge variant={htmlStats.hasImages ? "outline" : "destructive"} className="flex items-center gap-1">
                {htmlStats.hasImages ? "Містить зображення" : "Без зображень"}
              </Badge>
              
              <Badge variant={htmlStats.hasScripts ? "outline" : "destructive"} className="flex items-center gap-1">
                {htmlStats.hasScripts ? "Містить скрипти" : "Без скриптів"}
              </Badge>
              
              <Badge variant={htmlStats.hasStylesheets ? "outline" : "destructive"} className="flex items-center gap-1">
                {htmlStats.hasStylesheets ? "Містить стилі" : "Без стилів"}
              </Badge>
              
              {htmlStats.timestamp && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  {new Date(htmlStats.timestamp).toLocaleString()}
                </Badge>
              )}
            </div>
          )}
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
            
            <Button
              variant="outline"
              onClick={() => {
                if (htmlContent) {
                  navigator.clipboard.writeText(htmlContent);
                  alert('HTML скопійовано в буфер обміну');
                }
              }}
              disabled={!htmlContent}
            >
              Копіювати HTML
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
