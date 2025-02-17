
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Inspection } from "../types/inspection";

interface InspectionFormProps {
  inspection?: Inspection;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const InspectionForm = ({ inspection, onSubmit }: InspectionFormProps) => (
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
