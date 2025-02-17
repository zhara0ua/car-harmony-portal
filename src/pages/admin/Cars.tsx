
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cars = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Управління автомобілями</h1>
      <Card>
        <CardHeader>
          <CardTitle>Список автомобілів</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тут буде список автомобілів</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cars;
