import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2 } from "lucide-react";

interface Inspection {
  id: string;
  name: string;
  year: string;
  result: string;
  description: string;
  image_url: string;
}

interface InspectionFormData {
  name: string;
  year: string;
  result: string;
  description: string;
  image_url: string;
}

const Inspections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(
    null
  );
  const [formData, setFormData] = useState<InspectionFormData>({
    name: "",
    year: "",
    result: "",
    description: "",
    image_url: "",
  });

  const { data: inspections, isLoading } = useQuery({
    queryKey: ["inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspection_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Inspection[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newInspection: InspectionFormData) => {
      const { data, error } = await supabase
        .from("inspection_cases")
        .insert([newInspection]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({ title: "Інспекцію успішно додано" });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при додаванні інспекції",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (inspection: Inspection) => {
      const { data, error } = await supabase
        .from("inspection_cases")
        .update(inspection)
        .eq("id", inspection.id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({ title: "Інспекцію успішно оновлено" });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при оновленні інспекції",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inspection_cases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      toast({ title: "Інспекцію успішно видалено" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Помилка при видаленні інспекції",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInspection) {
      updateMutation.mutate({ ...formData, id: editingInspection.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setFormData(inspection);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Ви впевнені, що хочете видалити цю інспекцію?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      year: "",
      result: "",
      description: "",
      image_url: "",
    });
    setEditingInspection(null);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управління інспекціями</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Додати інспекцію</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInspection
                  ? "Редагувати інспекцію"
                  : "Додати нову інспекцію"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Рік</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="result">Результат</Label>
                  <Input
                    id="result"
                    value={formData.result}
                    onChange={(e) =>
                      setFormData({ ...formData, result: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Опис</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL зображення</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingInspection ? "Оновити" : "Додати"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Завантаження...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Рік</TableHead>
                <TableHead>Результат</TableHead>
                <TableHead>Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspections?.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>{inspection.name}</TableCell>
                  <TableCell>{inspection.year}</TableCell>
                  <TableCell>{inspection.result}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(inspection)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(inspection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
};

export default Inspections;