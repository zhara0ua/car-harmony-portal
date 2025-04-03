
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuctionCarsTable } from "@/components/admin/auctions/AuctionCarsTable";
import { AuctionFileUploader } from "@/components/admin/auctions/AuctionFileUploader";
import { SortField, SortOrder, useAuctionCars } from "@/hooks/useAuctionCars";

export default function AuctionCars() {
  const [sortField, setSortField] = useState<SortField>('end_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const { cars, isLoading, refetch } = useAuctionCars({ field: sortField, order: sortOrder });

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Import samochodów aukcyjnych</CardTitle>
          </CardHeader>
          <CardContent>
            <AuctionFileUploader onSuccess={refetch} />
          </CardContent>
        </Card>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          <AuctionCarsTable 
            cars={cars} 
            onSort={handleSort}
            currentSortField={sortField}
            currentSortOrder={sortOrder}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
