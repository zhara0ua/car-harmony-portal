
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Search, Phone, CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuctionRegistration, AuctionRegistrationDBResponse } from "./types/auction-registration";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CallStatusMap {
  [key: string]: { 
    status: 'called' | 'not_called' | 'callback';
    notes: string;
    callDate?: string;
    callbackDate?: string;
    callbackTime?: string;
  }
}

export default function AuctionRegistrations() {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatusMap>({});
  const [notes, setNotes] = useState<{[key: string]: string}>({});
  const [callbackDates, setCallbackDates] = useState<{[key: string]: Date | undefined}>({});
  const [callbackTimes, setCallbackTimes] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // Generate time slots for the select component (every 30 minutes)
  const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

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

      // Transform the database data to match our AuctionRegistration type
      const transformedData: AuctionRegistration[] = (data || []).map((item: AuctionRegistrationDBResponse) => ({
        id: item.id.toString(),
        createdAt: item.created_at,
        name: item.name,
        email: item.email || undefined,
        phone: item.phone,
        carId: item.car_id?.toString() || undefined,
        carBrand: item.car_brand || undefined,
        carModel: item.car_model || undefined,
        callStatus: {
          status: 'not_called',
          notes: ''
        }
      }));

      setRegistrations(transformedData);
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
        updatedStatus[id] = {
          status: value.called ? 'called' : (value.status || 'not_called'),
          notes: value.notes || "",
          callDate: value.callDate,
          callbackDate: value.callbackDate,
          callbackTime: value.callbackTime
        };
      });
      
      setCallStatus(updatedStatus);
      
      // Load callback dates if they exist
      const callbackDatesObj: {[key: string]: Date | undefined} = {};
      const callbackTimesObj: {[key: string]: string} = {};
      
      Object.entries(updatedStatus).forEach(([id, value]) => {
        if (value.callbackDate) {
          callbackDatesObj[id] = new Date(value.callbackDate);
        }
        if (value.callbackTime) {
          callbackTimesObj[id] = value.callbackTime;
        }
      });
      
      setCallbackDates(callbackDatesObj);
      setCallbackTimes(callbackTimesObj);
    }
  };

  const saveCallStatus = (newStatus: CallStatusMap) => {
    localStorage.setItem('auctionCallStatus', JSON.stringify(newStatus));
    setCallStatus(newStatus);
  };

  const handleStatusChange = (id: string, status: 'called' | 'not_called' | 'callback') => {
    const newStatus = { 
      ...callStatus,
      [id]: { 
        ...callStatus[id] || { notes: "" },
        status: status,
        notes: notes[id] || callStatus[id]?.notes || "",
        callDate: status === 'called' ? new Date().toISOString() : callStatus[id]?.callDate
      } 
    };
    
    if (status === 'callback') {
      if (callbackDates[id]) {
        newStatus[id].callbackDate = callbackDates[id]?.toISOString();
      }
      if (callbackTimes[id]) {
        newStatus[id].callbackTime = callbackTimes[id];
      }
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
        `Zaplanowano ponowny kontakt na ${callbackDates[id] ? format(callbackDates[id], 'dd/MM/yyyy') : 'wybraną datę'}${
          callbackTimes[id] ? ` o ${callbackTimes[id]}` : ''
        }` : 
        "Status połączenia został zaktualizowany",
    });
  };

  const handleNoteChange = (id: string, note: string) => {
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

  const handleCallbackDateChange = (id: string, date: Date | undefined) => {
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
        const timeInfo = callbackTimes[id] ? ` o ${callbackTimes[id]}` : '';
        toast({
          title: "Data kontaktu zaktualizowana",
          description: `Zaplanowano ponowny kontakt na ${format(date, 'dd/MM/yyyy')}${timeInfo}`,
        });
      }
    }
  };

  const handleCallbackTimeChange = (id: string, time: string) => {
    setCallbackTimes({
      ...callbackTimes,
      [id]: time
    });
    
    if (time && callStatus[id]) {
      const newStatus = {
        ...callStatus,
        [id]: {
          ...callStatus[id],
          callbackTime: time
        }
      };
      saveCallStatus(newStatus);
      
      if (callStatus[id].status === 'callback' && callbackDates[id]) {
        toast({
          title: "Czas kontaktu zaktualizowany",
          description: `Zaplanowano ponowny kontakt na ${format(callbackDates[id]!, 'dd/MM/yyyy')} o ${time}`,
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
    const headers = ['ID', 'Imię i nazwisko', 'Telefon', 'Data rejestracji', 'Status', 'Data przypomnienia', 'Czas przypomnienia', 'Notatki'];
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
          new Date(reg.createdAt).toLocaleDateString(),
          statusText,
          callStatus[reg.id]?.callbackDate ? `"${new Date(callStatus[reg.id].callbackDate!).toLocaleDateString()}"` : '',
          callStatus[reg.id]?.callbackTime || '',
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
                    <TableHead>Osoba</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Przypomnienie</TableHead>
                    <TableHead>Akcje</TableHead>
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
                        <div key={registration.id} className="border-b border-gray-200 last:border-b-0">
                          {/* First row with name, status, reminder, and actions */}
                          <TableRow className={`${rowClass} border-t`}>
                            <TableCell className="py-3">
                              <div className="font-medium">{registration.name}</div>
                              <div className="text-sm text-muted-foreground">
                                <a 
                                  href={`tel:${registration.phone}`} 
                                  className="flex items-center hover:text-primary"
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  {registration.phone}
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select 
                                value={status} 
                                onValueChange={(value: 'called' | 'not_called' | 'callback') => 
                                  handleStatusChange(registration.id, value)
                                }
                              >
                                <SelectTrigger className="w-[180px]">
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
                            </TableCell>
                            <TableCell>
                              {status === 'callback' && (
                                <div className="flex space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
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
                                              <CalendarIcon className="mr-2 h-4 w-4" />
                                              {callbackDates[registration.id] 
                                                ? format(callbackDates[registration.id]!, 'dd/MM/yyyy') 
                                                : 'Data'
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
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Wybierz datę kontaktu</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Select
                                          value={callbackTimes[registration.id] || ""}
                                          onValueChange={(value) => handleCallbackTimeChange(registration.id, value)}
                                        >
                                          <SelectTrigger className="w-[100px]">
                                            <SelectValue placeholder="Czas">
                                              {callbackTimes[registration.id] ? (
                                                <span className="flex items-center">
                                                  <ClockIcon className="h-4 w-4 mr-1 text-yellow-600" />
                                                  {callbackTimes[registration.id]}
                                                </span>
                                              ) : (
                                                <span className="flex items-center text-muted-foreground">
                                                  <ClockIcon className="h-4 w-4 mr-1" />
                                                  Czas
                                                </span>
                                              )}
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            {timeSlots.map(time => (
                                              <SelectItem key={time} value={time}>
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Wybierz czas kontaktu</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
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
                            </TableCell>
                          </TableRow>
                          
                          {/* Second row for additional information */}
                          <TableRow className={`${rowClass} border-t-0`}>
                            <TableCell colSpan={4} className="py-2 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <span className="font-medium">ID:</span> {registration.id}
                                </div>
                                <div>
                                  <span className="font-medium">Data rejestracji:</span> {new Date(registration.createdAt).toLocaleString()}
                                </div>
                                {registration.carBrand && (
                                  <div>
                                    <span className="font-medium">Samochód:</span> {registration.carBrand} {registration.carModel}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          
                          {/* New third row for notes */}
                          <TableRow className={`${rowClass} border-t-0 border-b`}>
                            <TableCell colSpan={4} className="py-2">
                              <div className="font-medium mb-1 text-sm">Notatki:</div>
                              <Textarea
                                placeholder="Dodaj notatkę..."
                                value={notes[registration.id] || callStatus[registration.id]?.notes || ""}
                                onChange={(e) => handleNoteChange(registration.id, e.target.value)}
                                onBlur={() => {
                                  if (notes[registration.id] || notes[registration.id] === "") {
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
                                className="min-h-[80px] w-full"
                              />
                            </TableCell>
                          </TableRow>
                        </div>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
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
