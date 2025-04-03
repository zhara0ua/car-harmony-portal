
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { z } from "zod";

// Validation schema for the form
const registrationSchema = z.object({
  name: z.string().min(2, { message: "Imię musi mieć co najmniej 2 znaki" }),
  phone: z.string().min(9, { message: "Wprowadź poprawny numer telefonu" }),
});

interface AuctionRegistrationDialogProps {
  isOpen: boolean;
  onRegistrationComplete: () => void;
}

export const AuctionRegistrationDialog: React.FC<AuctionRegistrationDialogProps> = ({
  isOpen,
  onRegistrationComplete,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate the form data
      const validationResult = registrationSchema.safeParse({ name, phone });
      
      if (!validationResult.success) {
        const formattedErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            formattedErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(formattedErrors);
        setIsSubmitting(false);
        return;
      }

      // Store the data in Supabase
      const { error } = await adminSupabase
        .from('auction_registrations')
        .insert([
          { name, phone }
        ]);

      if (error) {
        throw error;
      }

      // Save to localStorage to remember this user
      localStorage.setItem('auctionRegistered', 'true');

      // Show success message
      toast({
        title: "Rejestracja pomyślna",
        description: "Dziękujemy za rejestrację. Możesz teraz przeglądać aukcje.",
      });

      // Complete registration
      onRegistrationComplete();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Błąd rejestracji",
        description: "Wystąpił problem podczas rejestracji. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Dostęp do aukcji</DialogTitle>
          <DialogDescription>
            Aby uzyskać dostęp do aukcji samochodowych, musisz podać swoje dane kontaktowe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Imię i nazwisko
            </label>
            <Input
              id="name"
              placeholder="Twoje pełne imię"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Numer telefonu
            </label>
            <Input
              id="phone"
              type="tel" 
              placeholder="+48"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Zapisywanie..." : "Uzyskaj dostęp"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
