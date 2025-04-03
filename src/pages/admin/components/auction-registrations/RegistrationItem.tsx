
import React from "react";
import { RegistrationItemProps } from "./types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RegistrationItem: React.FC<RegistrationItemProps> = ({
  registration,
  callStatus,
  notes,
  callbackDates,
  saveCallStatus,
  handleStatusChange,
  handleNoteChange,
  handleCallbackDateChange
}) => {
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
};
