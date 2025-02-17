
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [editingInspection, setEditingInspection] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data);
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

  const handleEdit = (inspection) => {
    setEditingInspection(inspection);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newInspection = {
      car: form.car.value,
      client: form.client.value,
      date: form.date.value,
      status: form.status.value,
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

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedInspection = {
      ...editingInspection,
      car: form.car.value,
      client: form.client.value,
      date: form.date.value,
      status: form.status.value,
    };

    try {
      const { error } = await supabase
        .from('inspections')
        .update(updatedInspection)
        .eq('id', updatedInspection.id);

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

  const handleDelete = async (inspectionId) => {
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
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="car">Автомобіль</Label>
                <Input id="car" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Клієнт</Label>
                <Input id="client" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Input id="status" required />
              </div>
              <Button type="submit">Створити</Button>
            </form>
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(inspection)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редагувати інспекцію</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="car">Автомобіль</Label>
                            <Input id="car" defaultValue={inspection.car} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client">Клієнт</Label>
                            <Input id="client" defaultValue={inspection.client} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="date">Дата</Label>
                            <Input id="date" type="date" defaultValue={inspection.date} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Статус</Label>
                            <Input id="status" defaultValue={inspection.status} />
                          </div>
                          <Button type="submit">Зберегти</Button>
                        </form>
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
                            Ця дія не може бути скасована. Інспекція буде назавжди видалена з системи.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(inspection.id)} className="bg-red-500 hover:bg-red-600">
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
