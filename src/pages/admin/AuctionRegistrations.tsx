import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

type AuctionRegistration = {
  id: number;
  name: string;
  email: string;
  phone: string;
  carDetails: string;
  status: 'new' | 'contacted' | 'callback' | 'completed' | 'rejected';
  notes?: string;
  callDate?: string;
  callbackDate?: string;
  callbackTime?: string;
};

const AuctionRegistrations = () => {
  const [registrations, setRegistrations] = useState<AuctionRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://your-api-endpoint.com/auction-registrations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRegistrations(data);
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error!",
        description: "Failed to load auction registrations.",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const renderStatusCell = (registration: AuctionRegistration) => {
  const [status, setStatus] = useState(registration.status);
  const [notes, setNotes] = useState(registration.notes || '');
  const [callDate, setCallDate] = useState(registration.callDate || '');
  const [callbackDate, setCallbackDate] = useState(
    registration.status === 'callback' ? (registration.callbackDate || '') : ''
  );
  const [callbackTime, setCallbackTime] = useState(
    registration.status === 'callback' ? (registration.callbackTime || '') : ''
  );

  const handleStatusChange = (newStatus: 'new' | 'contacted' | 'callback' | 'completed' | 'rejected') => {
    setStatus(newStatus);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`https://your-api-endpoint.com/auction-registrations/${registration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          notes: notes,
          callDate: callDate,
          callbackDate: callbackDate,
          callbackTime: callbackTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: "Auction registration updated successfully.",
      })

      // Optionally, refresh the registrations list
      fetchRegistrations();
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error!",
        description: "Failed to update auction registration.",
        variant: "destructive",
      })
    }
  };

  return (
    <div>
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="callback">Callback</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      
      {status === 'callback' && (
        <>
          <div className="mt-2">
            <Label htmlFor="callbackDate">Callback Date</Label>
            <Input
              id="callbackDate"
              type="date"
              value={callbackDate}
              onChange={(e) => setCallbackDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-2">
            <Label htmlFor="callbackTime">Callback Time</Label>
            <Input
              id="callbackTime"
              type="time"
              value={callbackTime}
              onChange={(e) => setCallbackTime(e.target.value)}
              className="mt-1"
            />
          </div>
        </>
      )}
      
      <div className="mt-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={handleNotesChange}
          className="mt-1"
        />
      </div>
      <Button size="sm" className="mt-4" onClick={handleSubmit}>Save</Button>
    </div>
  );
};

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Auction Registrations</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Car Details</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>{registration.name}</TableCell>
              <TableCell>{registration.email}</TableCell>
              <TableCell>{registration.phone}</TableCell>
              <TableCell>{registration.carDetails}</TableCell>
              <TableCell>
                {renderStatusCell(registration)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuctionRegistrations;
