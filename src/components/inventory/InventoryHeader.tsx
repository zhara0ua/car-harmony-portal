
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface InventoryHeaderProps {
  onAddCar: () => void;
}

const InventoryHeader = ({ onAddCar }: InventoryHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-navy">Наші Автомобілі</h1>
      <Button 
        onClick={onAddCar}
        className="bg-navy hover:bg-navy/90 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Додати автомобіль
      </Button>
    </div>
  );
};

export default InventoryHeader;
