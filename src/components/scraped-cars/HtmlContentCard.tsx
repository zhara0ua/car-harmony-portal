
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HtmlContentCardProps {
  htmlContent: string | null;
}

export const HtmlContentCard = ({ htmlContent }: HtmlContentCardProps) => {
  return (
    <Card className="mb-8 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          OpenLane HTML код
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] border rounded-md p-4 bg-gray-50">
          {htmlContent ? (
            <pre className="text-xs whitespace-pre-wrap break-all">
              {htmlContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              HTML вміст з OpenLane недоступний. Запустіть скрапінг для отримання HTML коду.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
