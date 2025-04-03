
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AuctionRegistration } from "./types/auction-registration";
import { SearchBar } from "./components/auction-registrations/SearchBar";
import { ExportButton } from "./components/auction-registrations/ExportButton";
import { RegistrationsTable } from "./components/auction-registrations/RegistrationsTable";
import { CallStatusMap } from "./components/auction-registrations/types";

export default function AuctionRegistrations() {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatusMap>({});
  const [notes, setNotes] = useState<{[key: number]: string}>({});
  const [callbackDates, setCallbackDates] = useState<{[key: number]: Date | undefined}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
    loadCallStatus();
  }, []);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await adminSupabase
        .from('auction_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCallStatus = () => {
    const savedStatus = localStorage.getItem('auctionCallStatus');
    if (savedStatus) {
      const parsedStatus = JSON.parse(savedStatus);
      
      // Convert old format to new format if needed
      const updatedStatus: CallStatusMap = {};
      
      Object.entries(parsedStatus).forEach(([id, value]: [string, any]) => {
        updatedStatus[Number(id)] = {
          status: value.called ? 'called' : (value.status || 'not_called'),
          notes: value.notes || "",
          callDate: value.callDate,
          callbackDate: value.callbackDate
        };
      });
      
      setCallStatus(updatedStatus);
      
      // Load callback dates if they exist
      const callbackDatesObj: {[key: number]: Date | undefined} = {};
      Object.entries(updatedStatus).forEach(([id, value]) => {
        if (value.callbackDate) {
          callbackDatesObj[Number(id)] = new Date(value.callbackDate);
        }
      });
      
      setCallbackDates(callbackDatesObj);
    }
  };

  const saveCallStatus = (newStatus: CallStatusMap) => {
    localStorage.setItem('auctionCallStatus', JSON.stringify(newStatus));
    setCallStatus(newStatus);
  };

  const handleStatusChange = (id: number, status: 'called' | 'not_called' | 'callback') => {
    const newStatus = { 
      ...callStatus,
      [id]: { 
        ...callStatus[id] || { notes: "" },
        status: status,
        notes: notes[id] || callStatus[id]?.notes || "",
        callDate: status === 'called' ? new Date().toISOString() : callStatus[id]?.callDate
      } 
    };
    
    if (status === 'callback' && callbackDates[id]) {
      newStatus[id].callbackDate = callbackDates[id]?.toISOString();
    }
    
    saveCallStatus(newStatus);
    
    const statusMessages = {
      'called': "Zaznaczono jako wykonane",
      'not_called': "Status połączenia zresetowany",
      'callback': "Ustawiono przypomnienie kontaktu"
    };
    
    toast({
      title: statusMessages[status],
      description: status === 'callback' ? 
        `Zaplanowano ponowny kontakt na ${callbackDates[id] ? format(callbackDates[id], 'dd/MM/yyyy') : 'wybraną datę'}` : 
        "Status połączenia został zaktualizowany",
    });
  };

  const handleNoteChange = (id: number, note: string) => {
    setNotes({
      ...notes,
      [id]: note
    });
  };

  const handleCallbackDateChange = (id: number, date: Date | undefined) => {
    setCallbackDates({
      ...callbackDates,
      [id]: date
    });
    
    if (date && callStatus[id]) {
      const newStatus = {
        ...callStatus,
        [id]: {
          ...callStatus[id],
          callbackDate: date.toISOString()
        }
      };
      saveCallStatus(newStatus);
      
      if (callStatus[id].status === 'callback') {
        toast({
          title: "Data kontaktu zaktualizowana",
          description: `Zaplanowano ponowny kontakt na ${format(date, 'dd/MM/yyyy')}`,
        });
      }
    }
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm)
  );

  // Import format function for toast messages
  const { format } = require("date-fns");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRM Rejestracji z aukcji</h1>
        <ExportButton 
          filteredRegistrations={filteredRegistrations} 
          callStatus={callStatus} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Lista potencjalnych klientów</span>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationsTable
            isLoading={isLoading}
            filteredRegistrations={filteredRegistrations}
            callStatus={callStatus}
            notes={notes}
            callbackDates={callbackDates}
            saveCallStatus={saveCallStatus}
            handleStatusChange={handleStatusChange}
            handleNoteChange={handleNoteChange}
            handleCallbackDateChange={handleCallbackDateChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
