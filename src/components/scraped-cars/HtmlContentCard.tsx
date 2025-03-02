
import { FileText, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  
  const maxHeight = isExpanded ? "h-[600px]" : "h-[400px]";
  
  return (
    <Card className="mb-8 border-2 border-blue-200 overflow-hidden">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          OpenLane HTML код
        </CardTitle>
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Згорнути" : "Розгорнути"}
        </Button>
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
