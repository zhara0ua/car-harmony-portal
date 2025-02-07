import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface InspectionCase {
  id: number;
  image: string;
  name: string;
  year: string;
  result: string;
  description: string;
}

interface InspectionCaseCardProps {
  inspectionCase: InspectionCase;
}

const InspectionCaseCard = ({ inspectionCase }: InspectionCaseCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <img 
        src={inspectionCase.image} 
        alt={inspectionCase.name} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg">{inspectionCase.name}</h3>
        <p className="text-sm text-gray-600">{inspectionCase.year}</p>
        <p className="text-sm font-medium text-navy mt-2">{inspectionCase.result}</p>
        <Button 
          onClick={() => navigate(`/inspection/${inspectionCase.id}`)}
          className="w-full mt-4 bg-navy hover:bg-navy/90"
        >
          Детальніше
        </Button>
      </CardContent>
    </Card>
  );
};

export default InspectionCaseCard;