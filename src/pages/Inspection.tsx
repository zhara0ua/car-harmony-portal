
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Inspection = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send this data to your backend
    console.log({ name, phone, description });
    
    toast({
      title: "Запит надіслано",
      description: "Ми зв'яжемося з вами найближчим часом",
    });

    // Reset form
    setName("");
    setPhone("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-silver">
      <Navbar />
      
      <div className="container mx-auto px-6 py-16">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Замовити Інспекцію</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ваше ім'я</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введіть ваше ім'я"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Номер телефону</label>
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+380"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Опис</label>
                <Textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишіть, яку інспекцію ви хочете замовити"
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full bg-navy hover:bg-navy/90">
                Надіслати запит
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inspection;
