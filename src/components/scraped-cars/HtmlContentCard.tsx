
import { FileText, Search, RefreshCw, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface HtmlContentCardProps {
  htmlContent: string | null;
  onAnalyzeStructure?: (html: string) => void;
}

export const HtmlContentCard = ({ htmlContent, onAnalyzeStructure }: HtmlContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleAnalyze = () => {
    if (htmlContent) {
      if (onAnalyzeStructure) {
        onAnalyzeStructure(htmlContent);
      } else {
        toast({
          title: "Аналіз структури HTML",
          description: "Функція аналізу не налаштована. Зверніться до розробника.",
        });
      }
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
  const maxHeight = isExpanded ? "h-[600px]" : "h-[400px]";
  
  return (
    <Card className="mb-8 border-2 border-blue-200 overflow-hidden">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Оригінальний HTML код з OpenLane (скрапер)
          {htmlStats && (
            <Badge variant="outline" className="ml-2">
              {(htmlStats.byteSize / 1024).toFixed(1)} KB
            </Badge>
          )}
        </CardTitle>
        
        <CardDescription>
          Це HTML-код, який отримує і аналізує скрапер для знаходження автомобілів
        </CardDescription>
        
        {htmlStats && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
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
      </CardHeader>
      <CardContent>
        <ScrollArea className={`${maxHeight} border rounded-md p-4 bg-gray-50 transition-all duration-300`}>
          {htmlContent ? (
            <div className="prose prose-sm max-w-none">
              <pre className="text-xs whitespace-pre-wrap break-all">
                {htmlContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              HTML вміст з OpenLane недоступний. Запустіть скрапінг для отримання HTML коду.
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Згорнути" : "Розгорнути"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (htmlContent) {
                navigator.clipboard.writeText(htmlContent);
                toast({
                  title: "Скопійовано",
                  description: "HTML код скопійовано в буфер обміну"
                });
              }
            }}
            disabled={!htmlContent}
          >
            Копіювати HTML
          </Button>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleAnalyze}
          disabled={!htmlContent}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Аналізувати структуру
        </Button>
      </CardFooter>
    </Card>
  );
};
