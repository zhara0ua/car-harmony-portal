
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const settings = [
    { name: "Назва сайту", value: "AutoInspect" },
    { name: "Email для зв'язку", value: "contact@autoinspect.com" },
    { name: "Робочі години", value: "9:00 - 18:00" },
    { name: "Максимум інспекцій на день", value: "10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Налаштування сайту</h1>
      <Card>
        <CardHeader>
          <CardTitle>Загальні налаштування</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Параметр</TableHead>
                <TableHead>Значення</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => (
                <TableRow key={setting.name}>
                  <TableCell>{setting.name}</TableCell>
                  <TableCell>{setting.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
