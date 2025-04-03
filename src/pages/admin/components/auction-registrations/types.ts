
import { AuctionRegistration } from "../../types/auction-registration";

export type CallStatus = { 
  status: 'called' | 'not_called' | 'callback';
  notes: string;
  callDate?: string;
  callbackDate?: string;
}

export type CallStatusMap = {
  [key: number]: CallStatus;
}

export interface RegistrationItemProps {
  registration: AuctionRegistration;
  callStatus: CallStatusMap;
  notes: {[key: number]: string};
  callbackDates: {[key: number]: Date | undefined};
  saveCallStatus: (newStatus: CallStatusMap) => void;
  handleStatusChange: (id: number, status: 'called' | 'not_called' | 'callback') => void;
  handleNoteChange: (id: number, note: string) => void;
  handleCallbackDateChange: (id: number, date: Date | undefined) => void;
}
