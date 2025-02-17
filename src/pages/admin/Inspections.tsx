
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Inspection } from "./types/inspection";
import { InspectionForm } from "./components/InspectionForm";
import { InspectionsTable } from "./components/InspectionsTable";

const Inspections = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити дані інспекцій",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const newInspection = {
      car: formData.get('car') as string,
      client: formData.get('client') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as string,
    };

    try {
      const { error } = await supabase
        .from('inspections')
        .insert(newInspection);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Інспекцію створено",
      });

      fetchInspections();
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося створити інспекцію",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInspection) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const updatedInspection = {
      car: formData.get('car') as string,
      client: formData.get('client') as string,
      date: formData.get('date') as string,
      status: formData.get('status') as string,
    };

    try {
      const { error } = await supabase
        .from('inspections')
        .update(updatedInspection)
        .eq('id', editingInspection.id);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Інспекцію оновлено",
      });

      fetchInspections();
      setEditingInspection(null);
    } catch (error) {
      console.error('Error updating inspection:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося оновити інспекцію",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (inspectionId: number) => {
    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId);

      if (error) throw error;

      toast({
        title: "Успішно",
        description: "Інспекцію видалено",
      });

      fetchInspections();
    } catch (error) {
      console.error('Error deleting inspection:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося видалити інспекцію",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Управління інспекціями</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" />
              Створити інспекцію
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Створити інспекцію</DialogTitle>
            </DialogHeader>
            <InspectionForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список інспекцій</CardTitle>
        </CardHeader>
        <CardContent>
          <InspectionsTable 
            inspections={inspections}
            onEdit={setEditingInspection}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            editingInspection={editingInspection}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspections;
