
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Database, Network } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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
        <div className={`flex items-center space-x-2 p-4 rounded-md border ${useMockData ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800' : 'bg-muted'}`}>
          <Switch
            id="use-mock-data"
            checked={useMockData}
            onCheckedChange={onUseMockDataChange}
            className={useMockData ? 'data-[state=checked]:bg-blue-600' : ''}
          />
          <div className="flex-1">
            <Label htmlFor="use-mock-data" className="text-base font-medium flex items-center">
              {useMockData ? (
                <Network className="mr-2 text-blue-700" size={18} />
              ) : (
                <Database className="mr-2" size={18} />
              )}
              Use mock data
              {useMockData && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                  Recommended
                </Badge>
              )}
            </Label>
            <p className="text-sm text-muted-foreground">
              {useMockData 
                ? "Using sample data instead of real scraping (avoids Edge Function errors)"
                : "Using real scraping via Edge Functions (may cause network errors)"}
            </p>
          </div>
        </div>

        {useMockData && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400">
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
                disabled={useMockData}
                className={useMockData ? "bg-gray-100 text-gray-500" : ""}
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
                disabled={useMockData}
                className={useMockData ? "bg-gray-100 text-gray-500" : ""}
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
