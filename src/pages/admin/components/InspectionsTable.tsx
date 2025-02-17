
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { InspectionForm } from "./InspectionForm";
import { Inspection } from "../types/inspection";

interface InspectionsTableProps {
  inspections: Inspection[];
  onEdit: (inspection: Inspection) => void;
  onDelete: (inspectionId: number) => Promise<void>;
  onUpdate: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  editingInspection: Inspection | null;
}

export const InspectionsTable = ({ 
  inspections, 
  onEdit, 
  onDelete, 
  onUpdate,
  editingInspection 
}: InspectionsTableProps) => {
  return (
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
                    onClick={() => onEdit(inspection)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Редагувати інспекцію</DialogTitle>
                  </DialogHeader>
                  {editingInspection && (
                    <InspectionForm 
                      inspection={inspection} 
                      onSubmit={onUpdate} 
                    />
                  )}
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
                      onClick={() => onDelete(inspection.id)} 
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
  );
};
