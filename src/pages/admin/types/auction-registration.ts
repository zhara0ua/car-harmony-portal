
export type CallStatus = 
  | { status: "called" | "not_called"; notes: string; callDate?: string; }
  | { status: "callback"; notes: string; callDate?: string; callbackDate?: string; callbackTime?: string; };

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

// Database response type to match what we get from Supabase
export type AuctionRegistrationDBResponse = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email?: string;
  car_id?: number; 
  car_brand?: string;
  car_model?: string;
};
