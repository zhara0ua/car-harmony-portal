
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Users = () => {
  const users = [
    { id: 1, name: "Іван Петров", email: "ivan@example.com", role: "Користувач", status: "Активний" },
    { id: 2, name: "Марія Коваль", email: "maria@example.com", role: "Адмін", status: "Активний" },
    { id: 3, name: "Петро Сидоренко", email: "petro@example.com", role: "Користувач", status: "Неактивний" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Управління користувачами</h1>
      <Card>
        <CardHeader>
          <CardTitle>Список користувачів</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ім'я</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
