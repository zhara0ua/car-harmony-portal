
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AuctionRegistration } from "../../types/auction-registration";
import { CallStatusMap } from "./types";
import { RegistrationItem } from "./RegistrationItem";

interface RegistrationsTableProps {
  isLoading: boolean;
  filteredRegistrations: AuctionRegistration[];
  callStatus: CallStatusMap;
  notes: {[key: number]: string};
  callbackDates: {[key: number]: Date | undefined};
  saveCallStatus: (newStatus: CallStatusMap) => void;
  handleStatusChange: (id: number, status: 'called' | 'not_called' | 'callback') => void;
  handleNoteChange: (id: number, note: string) => void;
  handleCallbackDateChange: (id: number, date: Date | undefined) => void;
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  isLoading,
  filteredRegistrations,
  callStatus,
  notes,
  callbackDates,
  saveCallStatus,
  handleStatusChange,
  handleNoteChange,
  handleCallbackDateChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Klient</TableHead>
            <TableHead>Status i Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRegistrations.length > 0 ? (
            filteredRegistrations.map((registration) => (
              <RegistrationItem
                key={registration.id}
                registration={registration}
                callStatus={callStatus}
                notes={notes}
                callbackDates={callbackDates}
                saveCallStatus={saveCallStatus}
                handleStatusChange={handleStatusChange}
                handleNoteChange={handleNoteChange}
                handleCallbackDateChange={handleCallbackDateChange}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                Brak zarejestrowanych użytkowników
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
