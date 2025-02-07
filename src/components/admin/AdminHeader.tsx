
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminHeaderProps {
  onAddCar: () => void;
}

const AdminHeader = ({ onAddCar }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-navy">Адмін Панель</h1>
      <Button
        onClick={onAddCar}
        className="bg-navy hover:bg-navy/90 text-white rounded-full"
      >
        <Plus className="mr-2" /> Додати авто
      </Button>
    </div>
  );
};

export default AdminHeader;
