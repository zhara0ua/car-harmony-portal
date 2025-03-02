
import { Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface HtmlDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string | null;
}

export const HtmlDialog = ({ isOpen, onOpenChange, htmlContent }: HtmlDialogProps) => {
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
              <pre className="text-xs whitespace-pre-wrap break-all">
                {htmlContent}
              </pre>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                HTML вміст з OpenLane недоступний
              </div>
            )}
          </ScrollArea>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Закрити
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
