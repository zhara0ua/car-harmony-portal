
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AuctionRegistration } from "../../types/auction-registration";
import { CallStatusMap } from "./types";

interface ExportButtonProps {
  filteredRegistrations: AuctionRegistration[];
  callStatus: CallStatusMap;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  filteredRegistrations, 
  callStatus 
}) => {
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Imię i nazwisko', 'Telefon', 'Data rejestracji', 'Status', 'Data przypomnienia', 'Notatki'];
    const csvRows = [
      headers.join(','),
      ...filteredRegistrations.map(reg => {
        const status = callStatus[reg.id]?.status || 'not_called';
        const statusText = {
          'called': 'Zadzwoniono',
          'not_called': 'Niezadzwoniono',
          'callback': 'Do oddzwonienia'
        }[status];
        
        return [
          reg.id,
          `"${reg.name}"`, // Wrap in quotes to handle commas in names
          `"${reg.phone}"`,
          new Date(reg.created_at).toLocaleDateString(),
          statusText,
          callStatus[reg.id]?.callbackDate ? `"${new Date(callStatus[reg.id].callbackDate!).toLocaleDateString()}"` : '',
          `"${callStatus[reg.id]?.notes || ''}"`
        ].join(',');
      })
    ];
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auction_registrations_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={exportToCSV} className="flex items-center gap-2">
      <Download className="h-4 w-4" />
      Eksport CSV
    </Button>
  );
};
