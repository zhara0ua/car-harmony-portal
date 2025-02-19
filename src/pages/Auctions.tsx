
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuctionWithCar } from "@/types/auction";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Auctions = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');

  const { data: auctions, isLoading } = useQuery({
    queryKey: ['auctions', filter],
    queryFn: async () => {
      const query = supabase
        .from('auctions')
        .select(`
          id,
          car_id,
          start_price,
          current_price,
          end_date,
          status,
          winner_id,
          created_at,
          cars (
            name,
            image,
            year,
            mileage
          )
        `);

      if (filter !== 'all') {
        query.eq('status', filter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as AuctionWithCar[];
    }
  });

  const handleBid = (auctionId: number) => {
    // TODO: Implement bidding functionality
    console.log('Bidding on auction:', auctionId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Аукціони</h1>
            <div className="space-x-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Всі
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
              >
                Активні
              </Button>
              <Button 
                variant={filter === 'ended' ? 'default' : 'outline'}
                onClick={() => setFilter('ended')}
              >
                Завершені
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center">Завантаження...</div>
          ) : auctions?.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Наразі немає доступних аукціонів
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions?.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onBid={() => handleBid(auction.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auctions;
