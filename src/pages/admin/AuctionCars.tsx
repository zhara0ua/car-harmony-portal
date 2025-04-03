
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuctionCarsTable } from "@/components/admin/auctions/AuctionCarsTable";
import { AuctionFileUploader } from "@/components/admin/auctions/AuctionFileUploader";
import { SortField, SortOrder, useAuctionCars } from "@/hooks/useAuctionCars";
import { triggerAuctionScraping } from "@/utils/scraping";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AuctionCars() {
  const [sortField, setSortField] = useState<SortField>('end_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const { toast } = useToast();
  const { cars, isLoading, refetch } = useAuctionCars({ field: sortField, order: sortOrder });

  const handleSort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleStartScraping = async () => {
    setIsScrapingLoading(true);
    try {
      const result = await triggerAuctionScraping();
      toast({
        title: "Sukces",
        description: result.message || "Dane z aukcji zostały zaktualizowane",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas scrapowania aukcji",
        variant: "destructive",
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 flex-col md:flex-row">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Import samochodów aukcyjnych</CardTitle>
          </CardHeader>
          <CardContent>
            <AuctionFileUploader onUploadSuccess={refetch} />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Scrapowanie aukcji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Kliknij poniższy przycisk, aby pobrać najnowsze dane z aukcji.
              </p>
              <Button 
                onClick={handleStartScraping}
                disabled={isScrapingLoading}
                className="w-full"
              >
                {isScrapingLoading ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Pobieranie...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Pobierz dane aukcji
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
}
