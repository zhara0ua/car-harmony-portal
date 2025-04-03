
import { useState, useEffect } from "react";
import { adminSupabase } from "@/integrations/supabase/adminClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";

interface AuctionRegistration {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

export default function AuctionRegistrations() {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRegistrations();
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

      setRegistrations(data as AuctionRegistration[] || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm)
  );

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['ID', 'Imię i nazwisko', 'Telefon', 'Data rejestracji'];
    const csvRows = [
      headers.join(','),
      ...filteredRegistrations.map(reg => [
        reg.id,
        `"${reg.name}"`, // Wrap in quotes to handle commas in names
        `"${reg.phone}"`,
        new Date(reg.created_at).toLocaleDateString()
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
        <h1 className="text-2xl font-bold">Rejestracje z aukcji</h1>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Eksport CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Lista zarejestrowanych użytkowników</span>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>{registration.id}</TableCell>
                        <TableCell>{registration.name}</TableCell>
                        <TableCell>{registration.phone}</TableCell>
                        <TableCell>
                          {new Date(registration.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
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
