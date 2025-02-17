
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Inspection {
  id: number;
  car: string;
  client: string;
  date: string;
  status: string;
  created_at: string;
}

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

  const InspectionForm = ({ inspection, onSubmit }: { 
    inspection?: Inspection; 
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="car">Автомобіль</Label>
        <Input id="car" name="car" defaultValue={inspection?.car} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client">Клієнт</Label>
        <Input id="client" name="client" defaultValue={inspection?.client} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Дата</Label>
        <Input id="date" name="date" type="date" defaultValue={inspection?.date} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Статус</Label>
        <Select name="status" defaultValue={inspection?.status || "Новий"}>
          <SelectTrigger>
            <SelectValue placeholder="Виберіть статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Новий">Новий</SelectItem>
            <SelectItem value="В процесі">В процесі</SelectItem>
            <SelectItem value="Завершено">Завершено</SelectItem>
            <SelectItem value="Скасовано">Скасовано</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{inspection ? "Зберегти" : "Створити"}</Button>
    </form>
  );

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Автомобіль</TableHead>
                <TableHead>Клієнт</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>{inspection.id}</TableCell>
                  <TableCell>{inspection.car}</TableCell>
                  <TableCell>{inspection.client}</TableCell>
                  <TableCell>{inspection.date}</TableCell>
                  <TableCell>{inspection.status}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingInspection(inspection)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редагувати інспекцію</DialogTitle>
                        </DialogHeader>
                        <InspectionForm 
                          inspection={inspection} 
                          onSubmit={handleUpdate} 
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Видалити інспекцію?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ця дія не може бути скасована. Інспекцію буде назавжди видалено з системи.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(inspection.id)} 
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Видалити
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspections;
