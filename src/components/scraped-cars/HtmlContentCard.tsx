
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HtmlContentCardProps {
  htmlContent: string | null;
}

export const HtmlContentCard = ({ htmlContent }: HtmlContentCardProps) => {
  if (!htmlContent) return null;
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          HTML код
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/50">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {htmlContent}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
