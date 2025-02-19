
export interface Auction {
  id: number;
  car_id: number;
  start_price: number;
  current_price: number;
  end_date: string;
  status: 'active' | 'ended' | 'cancelled';
  winner_id?: string;
  created_at: string;
}

export interface AuctionWithCar extends Auction {
  cars: {
    name: string;
    image: string;
    year: number;
    mileage: string;
  };
}
