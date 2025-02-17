
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Налаштування сайту</h1>
      <Card>
        <CardHeader>
          <CardTitle>Загальні налаштування</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тут будуть налаштування сайту</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
