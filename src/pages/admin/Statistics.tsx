
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Statistics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Статистика</h1>
      <Card>
        <CardHeader>
          <CardTitle>Загальна статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тут буде статистика</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
