
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, Phone, CheckCircle, XCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AuctionRegistration } from "./types/auction-registration";

interface CallStatus {
  [key: number]: { 
    called: boolean;
    notes: string;
    callDate?: string;
  }
}

export default function AuctionRegistrations() {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [callStatus, setCallStatus] = useState<CallStatus>({});
  const [notes, setNotes] = useState<{[key: number]: string}>({});
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
      setCallStatus(JSON.parse(savedStatus));
    }
  };

  const saveCallStatus = (newStatus: CallStatus) => {
    localStorage.setItem('auctionCallStatus', JSON.stringify(newStatus));
    setCallStatus(newStatus);
  };

  const handleMarkAsCalled = (id: number) => {
    const newStatus = { 
      ...callStatus, 
      [id]: { 
        called: true, 
        notes: notes[id] || callStatus[id]?.notes || "",
        callDate: new Date().toISOString()
      } 
    };
    saveCallStatus(newStatus);
    toast({
      title: "Zaznaczono jako wykonane",
      description: "Status połączenia został zaktualizowany",
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

  const handleResetCall = (id: number) => {
    const newStatus = { 
      ...callStatus
    };
    delete newStatus[id];
    saveCallStatus(newStatus);
    toast({
      title: "Status połączenia zresetowany",
      description: "Ten kontakt można ponownie zadzwonić",
    });
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Imię i nazwisko', 'Telefon', 'Data rejestracji', 'Status połączenia', 'Notatki'];
    const csvRows = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        reg.id,
        `"${reg.name}"`, // Wrap in quotes to handle commas in names
        `"${reg.phone}"`,
        new Date(reg.created_at).toLocaleDateString(),
        callStatus[reg.id]?.called ? 'Zadzwoniono' : 'Niezadzwoniono',
        `"${callStatus[reg.id]?.notes || ''}"`
      ].join(','))
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
                    <TableHead>ID</TableHead>
                    <TableHead>Imię i nazwisko</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Data rejestracji</TableHead>
                    <TableHead>Status połączenia</TableHead>
                    <TableHead>Notatki</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id} className={callStatus[registration.id]?.called ? "bg-green-50" : ""}>
                        <TableCell>{registration.id}</TableCell>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>
                          <a 
                            href={`tel:${registration.phone}`} 
                            className="flex items-center hover:text-primary"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            {registration.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(registration.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Checkbox 
                              id={`called-${registration.id}`}
                              checked={!!callStatus[registration.id]?.called}
                              onCheckedChange={() => {
                                if (callStatus[registration.id]?.called) {
                                  handleResetCall(registration.id);
                                } else {
                                  handleMarkAsCalled(registration.id);
                                }
                              }}
                            />
                            <label 
                              htmlFor={`called-${registration.id}`}
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {callStatus[registration.id]?.called ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Zadzwoniono
                                  {callStatus[registration.id]?.callDate && (
                                    <span className="text-xs ml-1 text-muted-foreground">
                                      ({new Date(callStatus[registration.id].callDate!).toLocaleDateString()})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-center">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Do wykonania
                                </span>
                              )}
                            </label>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Dodaj notatkę..."
                            value={notes[registration.id] || callStatus[registration.id]?.notes || ""}
                            onChange={(e) => handleNoteChange(registration.id, e.target.value)}
                            onBlur={() => {
                              if (notes[registration.id]) {
                                const newStatus = {
                                  ...callStatus,
                                  [registration.id]: {
                                    ...callStatus[registration.id] || { called: false },
                                    notes: notes[registration.id]
                                  }
                                };
                                saveCallStatus(newStatus);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {!callStatus[registration.id]?.called ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleMarkAsCalled(registration.id)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Zaznacz jako wykonane
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleResetCall(registration.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Zresetuj status
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
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
