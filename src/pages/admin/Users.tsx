
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Users = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Управління користувачами</h1>
      <Card>
        <CardHeader>
          <CardTitle>Список користувачів</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тут буде список користувачів</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
