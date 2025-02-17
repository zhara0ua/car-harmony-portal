
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Statistics = () => {
  const stats = [
    { metric: "Всього користувачів", value: "150" },
    { metric: "Активних інспекцій", value: "25" },
    { metric: "Автомобілів в наявності", value: "45" },
    { metric: "Завершених інспекцій", value: "312" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Статистика</h1>
      <Card>
        <CardHeader>
          <CardTitle>Загальна статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Метрика</TableHead>
                <TableHead>Значення</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.metric}>
                  <TableCell>{stat.metric}</TableCell>
                  <TableCell>{stat.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
