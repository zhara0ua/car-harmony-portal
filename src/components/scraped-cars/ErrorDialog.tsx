
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage: string;
  errorDetails: string;
}

export const ErrorDialog = ({ 
  isOpen, 
  onOpenChange, 
  errorMessage, 
  errorDetails 
}: ErrorDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Помилка скрапінгу
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{errorMessage}</p>
            {errorDetails && (
              <div className="mt-2 p-3 bg-muted text-sm rounded-md overflow-auto max-h-40">
                {errorDetails}
              </div>
            )}
            <p className="text-sm font-medium mt-2">
              Будь ласка, перевірте логи сервера або спробуйте пізніше.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Зрозуміло
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
