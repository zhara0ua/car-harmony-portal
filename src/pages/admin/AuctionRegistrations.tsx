
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuctionRegistration } from "./types/auction-registration";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CallStatus {
  [key: number]: { 
    status: 'called' | 'not_called' | 'callback';
    notes: string;
    callDate?: string;
    callbackDate?: string;
  }
}

export default function AuctionRegistrations() {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatus>({});
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
      const updatedStatus: CallStatus = {};
      
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

  const saveCallStatus = (newStatus: CallStatus) => {
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
    
    // Save note to call status
    if (callStatus[id]) {
      const newStatus = {
        ...callStatus,
        [id]: {
          ...callStatus[id],
          notes: note
        }
      };
      saveCallStatus(newStatus);
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRM Rejestracji z aukcji</h1>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Eksport CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Lista potencjalnych klientów</span>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
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
                    filteredRegistrations.map((registration) => {
                      const status = callStatus[registration.id]?.status || 'not_called';
                      const rowClass = 
                        status === 'called' ? "bg-green-50" : 
                        status === 'callback' ? "bg-yellow-50" : "";
                      
                      return (
                        <TableRow key={registration.id} className={rowClass}>
                          {/* First cell: Customer information */}
                          <TableCell className="py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="font-medium">{registration.name}</div>
                                <a 
                                  href={`tel:${registration.phone}`} 
                                  className="flex items-center hover:text-primary text-sm"
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  {registration.phone}
                                </a>
                                <div className="text-xs text-muted-foreground mt-1">
                                  ID: {registration.id} | Rejestracja: {new Date(registration.created_at).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <Input
                                  placeholder="Dodaj notatkę..."
                                  value={notes[registration.id] || callStatus[registration.id]?.notes || ""}
                                  onChange={(e) => handleNoteChange(registration.id, e.target.value)}
                                  onBlur={() => {
                                    if (notes[registration.id]) {
                                      const newStatus = {
                                        ...callStatus,
                                        [registration.id]: {
                                          ...callStatus[registration.id] || { status: 'not_called' },
                                          notes: notes[registration.id]
                                        }
                                      };
                                      saveCallStatus(newStatus);
                                    }
                                  }}
                                  className="mb-2"
                                />
                              </div>
                            </div>
                          </TableCell>
                          
                          {/* Second cell: Status and actions */}
                          <TableCell className="py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col space-y-2">
                                <Select 
                                  value={status} 
                                  onValueChange={(value: 'called' | 'not_called' | 'callback') => 
                                    handleStatusChange(registration.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue>
                                      {status === 'called' && (
                                        <span className="text-green-600 flex items-center">
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                          Zadzwoniono
                                        </span>
                                      )}
                                      {status === 'not_called' && (
                                        <span className="text-red-600 flex items-center">
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Do wykonania
                                        </span>
                                      )}
                                      {status === 'callback' && (
                                        <span className="text-yellow-600 flex items-center">
                                          <Clock className="h-4 w-4 mr-1" />
                                          Do oddzwonienia
                                        </span>
                                      )}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="called">
                                      <span className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                        Zadzwoniono
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="not_called">
                                      <span className="flex items-center">
                                        <XCircle className="h-4 w-4 mr-1 text-red-600" />
                                        Do wykonania
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="callback">
                                      <span className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-yellow-600" />
                                        Do oddzwonienia
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {status === 'callback' && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        className={
                                          callbackDates[registration.id] 
                                            ? "text-yellow-600" 
                                            : "text-muted-foreground"
                                        }
                                      >
                                        <Clock className="mr-2 h-4 w-4" />
                                        {callbackDates[registration.id] 
                                          ? format(callbackDates[registration.id]!, 'dd/MM/yyyy') 
                                          : 'Wybierz datę'
                                        }
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={callbackDates[registration.id]}
                                        onSelect={(date) => handleCallbackDateChange(registration.id, date)}
                                        initialFocus
                                        className="pointer-events-auto"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                {status === 'not_called' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleStatusChange(registration.id, 'called')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Zaznacz jako wykonane
                                  </Button>
                                )}
                                {status === 'called' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleStatusChange(registration.id, 'not_called')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Zresetuj status
                                  </Button>
                                )}
                                {status !== 'callback' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => handleStatusChange(registration.id, 'callback')}
                                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Zadzwonić później
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
