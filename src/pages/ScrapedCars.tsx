import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { type Filters, type ScrapedCar } from "@/types/scraped-car";
import { triggerScraping } from "@/utils/scraping";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrapedCarsFilters } from "@/components/scraped-cars/ScrapedCarsFilters";
import { ScrapingActions } from "@/components/scraped-cars/ScrapingActions";
import { HtmlContentCard } from "@/components/scraped-cars/HtmlContentCard";
import { HtmlDialog } from "@/components/scraped-cars/HtmlDialog";
import { ErrorDialog } from "@/components/scraped-cars/ErrorDialog";
import { CarsList } from "@/components/scraped-cars/CarsList";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function ScrapedCars() {
  const [filters, setFilters] = useState<Filters>({});
  const [isScrapingInProgress, setIsScrapingInProgress] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isHtmlDialogOpen, setIsHtmlDialogOpen] = useState(false);
  const [isStructureDialogOpen, setIsStructureDialogOpen] = useState(false);
  const [structureAnalysis, setStructureAnalysis] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (htmlContent) {
      console.log('HTML content updated, length:', htmlContent.length);
    } else {
      console.log('HTML content is null or empty');
    }
  }, [htmlContent]);
  
  const { data: cars, isLoading, refetch } = useQuery({
    queryKey: ['scraped-cars', filters],
    queryFn: async () => {
      console.log('Fetching cars with filters:', filters);
      let query = supabase
        .from('scraped_cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.fuelType) {
        query = query.eq('fuel_type', filters.fuelType);
      }
      if (filters.transmission) {
        query = query.eq('transmission', filters.transmission);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      
      console.log('Query result:', { data, error });
      
      if (error) throw error;
      return data as ScrapedCar[];
    }
  });

  const analyzeHtmlStructure = (html: string) => {
    try {
      console.log('Analyzing HTML structure...');
      
      // Parse the HTML and identify potential car listing containers
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Find elements that might contain car listings
      const results: string[] = [];
      
      // Add a divider
      results.push("=== POTENTIAL CAR CONTAINERS ===");
      
      // Look for elements with multiple similar child elements (potential listings)
      const elements = doc.querySelectorAll('div, section, article, ul');
      
      // Track the most promising container candidates
      const containerCandidates: {selector: string, childCount: number, text: string}[] = [];
      
      elements.forEach(el => {
        const children = el.children;
        if (children.length >= 3) {
          // Check if children have similar structure
          const tagCounts: Record<string, number> = {};
          const classCounts: Record<string, number> = {};
          
          Array.from(children).forEach(child => {
            // Count tag types
            const tag = child.tagName.toLowerCase();
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            
            // Count class patterns
            if (child.className) {
              const className = child.className;
              classCounts[className] = (classCounts[className] || 0) + 1;
            }
          });
          
          // Check if there's a dominant tag or class pattern
          const dominantTagCount = Math.max(...Object.values(tagCounts));
          const dominantClassCount = Object.values(classCounts).length > 0 
            ? Math.max(...Object.values(classCounts)) 
            : 0;
          
          if (dominantTagCount >= 3 || dominantClassCount >= 2) {
            // This might be a container with car listings
            const potentialSelector = el.tagName.toLowerCase() + 
              (el.id ? `#${el.id}` : '') + 
              (el.className ? `.${el.className.split(' ').join('.')}` : '');
            
            // Get some text content for identification
            const textContent = el.textContent?.substring(0, 100).trim() || '';
            
            containerCandidates.push({
              selector: potentialSelector,
              childCount: children.length,
              text: textContent
            });
          }
        }
      });
      
      // Sort candidates by child count (most children first)
      containerCandidates.sort((a, b) => b.childCount - a.childCount);
      
      // Take the top 10 candidates
      const topCandidates = containerCandidates.slice(0, 10);
      
      topCandidates.forEach((candidate, index) => {
        results.push(`${index + 1}. Container selector: ${candidate.selector}`);
        results.push(`   Child elements: ${candidate.childCount}`);
        results.push(`   Text preview: ${candidate.text}`);
        results.push('');
      });
      
      // Add a divider
      results.push("=== RECOMMENDED SELECTORS ===");
      
      // Generate recommended selectors for scrapers
      const recommendedSelectors = topCandidates.map(c => c.selector);
      results.push(recommendedSelectors.join(',\n'));
      
      // Add a divider
      results.push("\n=== COMMON HTML PATTERNS ===");
      
      // Detect common patterns for car listings
      const carTerms = ['car', 'vehicle', 'auto', 'listing', 'auction', 'lot', 'price', 'model', 'make'];
      const matchingElements: string[] = [];
      
      carTerms.forEach(term => {
        // Look for elements containing car-related terms in their attributes
        const termElements = doc.querySelectorAll(`[class*=${term}], [id*=${term}]`);
        termElements.forEach(el => {
          const selector = el.tagName.toLowerCase() + 
            (el.id ? `#${el.id}` : '') + 
            (el.className ? `.${el.className.split(' ').join('.')}` : '');
          
          if (!matchingElements.includes(selector)) {
            matchingElements.push(selector);
          }
        });
      });
      
      setStructureAnalysis(results.join('\n'));
      setIsStructureDialogOpen(true);
      
      toast({
        title: "Аналіз структури HTML",
        description: "Знайдено потенційні контейнери автомобілів: " + topCandidates.length,
      });
    } catch (error) {
      console.error('Error analyzing HTML structure:', error);
      toast({
        title: "Помилка аналізу HTML",
        description: "Не вдалося проаналізувати структуру HTML",
        variant: "destructive"
      });
    }
  };

  const extractHtmlFromResponse = (result: any): string | null => {
    console.log('Extracting HTML from response:', result);
    
    if (!result) return null;
    
    // Directly check for HTML content in the raw data from the scraper
    // Places where scraper might store raw HTML
    const scrapedHtmlLocations = [
      result.debug?.htmlContent,
      result.debug?.raw_html,
      result.htmlContent,
      result.raw_html,
      result.rawHtml
    ];
    
    // Helper function to check if string is likely HTML
    const isLikelyHtml = (text: string): boolean => {
      if (typeof text !== 'string') return false;
      
      const htmlIndicators = [
        '<!DOCTYPE html>',
        '<html',
        '<body',
        '<div class=',
        '<head',
        '<title'
      ];
      
      return htmlIndicators.some(indicator => text.includes(indicator));
    };
    
    // First try the direct locations where scraper stores HTML
    for (const location of scrapedHtmlLocations) {
      if (typeof location === 'string' && location.length > 100 && isLikelyHtml(location)) {
        console.log('Found HTML directly from scraper');
        return location;
      }
    }
    
    // If not found, do a deep search in the response object
    const findHtmlDeep = (obj: any, depth = 0): string | null => {
      if (depth > 10 || !obj || typeof obj !== 'object') return null;
      
      for (const [key, value] of Object.entries(obj)) {
        // Look specifically for keys that might contain HTML
        const isHtmlKey = key.toLowerCase().includes('html') || 
                          key.toLowerCase().includes('content') ||
                          key.toLowerCase().includes('raw');
                          
        if (isHtmlKey && typeof value === 'string' && value.length > 100 && isLikelyHtml(value)) {
          console.log(`Found HTML in object at key ${key}`);
          return value;
        }
        
        if (value && typeof value === 'object') {
          const nestedHtml = findHtmlDeep(value, depth + 1);
          if (nestedHtml) return nestedHtml;
        }
      }
      
      return null;
    };
    
    const deepHtml = findHtmlDeep(result);
    if (deepHtml) {
      console.log('Found HTML through deep search');
      return deepHtml;
    }
    
    // Final fallback: look for any large string in the object
    const findLargeStringDeep = (obj: any, depth = 0): string | null => {
      if (depth > 10 || !obj || typeof obj !== 'object') return null;
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.length > 500) {
          console.log(`Found large string in object at key ${key}`);
          return value;
        }
        
        if (value && typeof value === 'object') {
          const nestedString = findLargeStringDeep(value, depth + 1);
          if (nestedString) return nestedString;
        }
      }
      
      return null;
    };
    
    const largeString = findLargeStringDeep(result);
    if (largeString) {
      console.log('Found large string that might be HTML');
      return largeString;
    }
    
    console.log('No HTML content found in the response');
    return null;
  };

  const handleScraping = async () => {
    try {
      setIsScrapingInProgress(true);
      toast({
        title: "Початок скрапінгу",
        description: "Запускаємо процес отримання даних. Це може зайняти кілька хвилин...",
      });
      
      console.log('Starting scraping process...');
      const result = await triggerScraping();
      
      console.log('Scraping result received:', result);
      
      // Make sure to extract the original HTML that was scraped
      const extractedHtml = extractHtmlFromResponse(result);
      
      if (extractedHtml) {
        console.log(`Setting HTML content (${extractedHtml.length} chars)`);
        console.log('HTML preview:', extractedHtml.substring(0, 100) + '...');
        setHtmlContent(extractedHtml);
      } else {
        console.log('No HTML content found, creating fallback HTML');
        const fallbackHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OpenLane HTML Content Not Found</title>
            <meta charset="utf-8">
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px; border-radius: 5px;">
              <h1>No OpenLane HTML Content</h1>
              <p>The scraper did not return HTML content from OpenLane. This is a generated fallback message.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
              <p>Response data:</p>
              <pre>${JSON.stringify(result, null, 2)}</pre>
            </div>
          </body>
          </html>
        `;
        console.log('Setting fallback HTML content');
        setHtmlContent(fallbackHtml);
      }
      
      toast({
        title: "Успіх",
        description: result.message || "Дані успішно оновлено",
      });
      
      console.log('Scraping completed, refreshing data...');
      refetch();
    } catch (error) {
      console.error('Error during scraping:', error);
      
      let errorMsg = "Не вдалося отримати дані з сайту";
      let detailsMsg = "";
      const errorObj = error as any;
      
      if (errorObj?.message) {
        errorMsg = errorObj.message;
        
        if (errorMsg.includes(" - ")) {
          const parts = errorMsg.split(" - ");
          errorMsg = parts[0];
          detailsMsg = parts.slice(1).join(" - ");
        }
      }
      
      let errorHtml = extractHtmlFromResponse(errorObj);
      
      if (!errorHtml) {
        errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>OpenLane Scraper Error</title>
            <meta charset="utf-8">
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid red; margin: 20px; border-radius: 5px; color: red;">
              <h1>Error Occurred During OpenLane Scraping</h1>
              <p><strong>Error:</strong> ${errorMsg}</p>
              ${detailsMsg ? `<p><strong>Details:</strong> ${detailsMsg}</p>` : ''}
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Error object:</strong></p>
              <pre>${JSON.stringify(errorObj, null, 2)}</pre>
            </div>
          </body>
          </html>
        `;
      }
      
      console.log('Setting error HTML content');
      setHtmlContent(errorHtml);
      
      setErrorMessage(errorMsg);
      setErrorDetails(detailsMsg);
      setIsErrorDialogOpen(true);
      
      toast({
        title: "Помилка скрапінгу",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsScrapingInProgress(false);
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    console.log('Applying new filters:', newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Автомобілі з OpenLane</h1>
            <ScrapingActions 
              onScrape={handleScraping}
              isScrapingInProgress={isScrapingInProgress}
              htmlContent={htmlContent}
              onShowHtml={() => setIsHtmlDialogOpen(true)}
            />
          </div>

          <ScrapedCarsFilters onFilterChange={handleFilterChange} />
          
          <HtmlContentCard 
            htmlContent={htmlContent} 
            onAnalyzeStructure={analyzeHtmlStructure}
          />

          <CarsList cars={cars} isLoading={isLoading} />
        </div>
      </main>

      <Footer />

      <ErrorDialog 
        isOpen={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        errorMessage={errorMessage}
        errorDetails={errorDetails}
      />

      <HtmlDialog 
        isOpen={isHtmlDialogOpen}
        onOpenChange={setIsHtmlDialogOpen}
        htmlContent={htmlContent}
        onAnalyzeStructure={analyzeHtmlStructure}
      />
      
      <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Аналіз структури HTML</DialogTitle>
            <DialogDescription>
              Результати аналізу для визначення потенційних контейнерів автомобілів
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] border rounded-md p-4 bg-muted/20">
            <pre className="text-xs whitespace-pre-wrap font-mono">
              {structureAnalysis}
            </pre>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(structureAnalysis);
                toast({
                  title: "Скопійовано",
                  description: "Результати аналізу скопійовано в буфер обміну"
                });
              }}
              variant="secondary"
            >
              Копіювати
            </Button>
            <Button onClick={() => setIsStructureDialogOpen(false)}>
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
