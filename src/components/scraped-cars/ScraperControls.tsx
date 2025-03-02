
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ReloadIcon } from '@radix-ui/react-icons';
import { LuDatabase } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScraperControlsProps {
  onScrape: (site: string, url: string, useMockData: boolean) => void;
  loading: boolean;
  useMockData: boolean;
  onUseMockDataChange: (value: boolean) => void;
}

export const ScraperControls: React.FC<ScraperControlsProps> = ({
  onScrape,
  loading,
  useMockData,
  onUseMockDataChange
}) => {
  const [selectedSite, setSelectedSite] = useState('findcar');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onScrape(selectedSite, url, useMockData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 bg-muted p-4 rounded-md border">
          <Switch
            id="use-mock-data"
            checked={useMockData}
            onCheckedChange={onUseMockDataChange}
          />
          <div className="flex-1">
            <Label htmlFor="use-mock-data" className="text-base font-medium flex items-center">
              <LuDatabase className="mr-2" />
              Use mock data
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable this to use sample data instead of real scraping (avoids Edge Function errors)
            </p>
          </div>
        </div>

        {useMockData && (
          <Alert>
            <AlertDescription>
              Mock data mode is enabled. This will use predefined car data instead of scraping websites.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="findcar" onValueChange={setSelectedSite}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="findcar">FindCar</TabsTrigger>
            <TabsTrigger value="openlane">OpenLane</TabsTrigger>
          </TabsList>
          <TabsContent value="findcar" className="p-4 border rounded-md mt-2">
            <div className="space-y-2">
              <Label htmlFor="findcar-url">FindCar URL:</Label>
              <Input
                id="findcar-url"
                placeholder="Enter FindCar search URL or leave empty for default"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Example: https://car-from-usa.com/search/?page=1
              </p>
            </div>
          </TabsContent>
          <TabsContent value="openlane" className="p-4 border rounded-md mt-2">
            <div className="space-y-2">
              <Label htmlFor="openlane-url">OpenLane URL:</Label>
              <Input
                id="openlane-url"
                placeholder="Enter OpenLane search URL or leave empty for default"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Example: https://www.openlane.com/search-results?make=Toyota
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Пошук...
              </>
            ) : (
              'Шукати'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
