
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuctionRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCAL_STORAGE_KEY = "auction_registration_completed";

export function AuctionRegistrationDialog({
  open,
  onOpenChange,
}: AuctionRegistrationDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState({ name: false, phone: false });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleClose = () => {
    toast({
      title: "Rejestracja wymagana",
      description: "Wymagana jest szybka rejestracja na stronie aukcji",
      variant: "destructive",
    });
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const errors = {
      name: name.trim() === "",
      phone: phone.trim() === "",
    };
    setHasError(errors);

    if (errors.name || errors.phone) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert data into Supabase
      const { error } = await supabase
        .from('auction_registrations')
        .insert([{ name, phone }]);

      if (error) {
        throw error;
      }

      // Save to local storage to remember this user
      localStorage.setItem(LOCAL_STORAGE_KEY, "true");
      
      // Close dialog
      onOpenChange(false);
      
      toast({
        title: "Rejestracja udana",
        description: "Dziękujemy za rejestrację na naszej stronie aukcji!",
      });
    } catch (error) {
      console.error("Error registering:", error);
      toast({
        title: "Błąd rejestracji",
        description: "Spróbuj ponownie później",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        handleClose();
      } else {
        onOpenChange(newOpen);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rejestracja na aukcję</DialogTitle>
          <DialogDescription>
            Aby przejść do strony aukcji, wypełnij poniższy formularz. Używamy tych danych, aby skontaktować się z Tobą w sprawie szczegółów.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={hasError.name ? "border-red-500" : ""}
              placeholder="Jan Kowalski"
            />
            {hasError.name && (
              <p className="text-red-500 text-sm">Imię jest wymagane</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numer telefonu</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={hasError.phone ? "border-red-500" : ""}
              placeholder="+48 123 456 789"
            />
            {hasError.phone && (
              <p className="text-red-500 text-sm">Telefon jest wymagany</p>
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Zapisywanie..." : "Zarejestruj się"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
