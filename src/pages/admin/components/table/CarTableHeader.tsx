
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const CarTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>Назва</TableHead>
        <TableHead>Марка</TableHead>
        <TableHead>Модель</TableHead>
        <TableHead>Рік</TableHead>
        <TableHead>Ціна</TableHead>
        <TableHead>Фото</TableHead>
        <TableHead>Дії</TableHead>
      </TableRow>
    </TableHeader>
  );
};
