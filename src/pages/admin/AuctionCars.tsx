
import React from "react";
import { JsonFormatInfo } from "@/components/admin/auctions/JsonFormatInfo";
import { AuctionFileUploader } from "@/components/admin/auctions/AuctionFileUploader";
import { AuctionCarsTable } from "@/components/admin/auctions/AuctionCarsTable";
import { useAuctionCars } from "@/hooks/useAuctionCars";

export default function AuctionCars() {
  const { cars, refetch } = useAuctionCars();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Zarządzanie aukcjami</h1>
        <JsonFormatInfo />
      </div>
      
      <AuctionFileUploader onUploadSuccess={refetch} />
      
      <AuctionCarsTable cars={cars} />
    </div>
  );
}
