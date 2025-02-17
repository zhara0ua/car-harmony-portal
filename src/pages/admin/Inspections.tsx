
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Inspections = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Управління інспекціями</h1>
      <Card>
        <CardHeader>
          <CardTitle>Список інспекцій</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тут буде список інспекцій</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inspections;
