

export type CallStatus = 
  | { status: "called" | "not_called"; notes: string; callDate?: string; }
  | { status: "callback"; notes: string; callDate?: string; callbackDate?: string; };

export type AuctionRegistration = {
  id: string;
  createdAt: string;
  name: string;
  email?: string;
  phone: string;
  carId?: string;
  carBrand?: string;
  carModel?: string;
  callStatus: CallStatus;
};

