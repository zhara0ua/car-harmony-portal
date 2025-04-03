
import React from "react";
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogAction 
} from "@/components/ui/alert-dialog";

interface AuctionErrorDialogProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
}

export const AuctionErrorDialog = ({
  isOpen,
  errorMessage,
  onClose
}: AuctionErrorDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Błąd</AlertDialogTitle>
          <AlertDialogDescription>
            {errorMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Rozumiem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
