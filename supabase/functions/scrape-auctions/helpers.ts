
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Cleans HTML by removing tags and trimming whitespace
 */
export function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Creates custom request headers for web scraping
 */
export function createScrapingHeaders() {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };
}

/**
 * Creates a unique external ID for an auction car
 */
export function generateExternalId(index: number): string {
  return `openlane-${Date.now()}-${Math.random().toString(36).substring(2, 6)}-${index}`;
}

/**
 * Generates a random end date within the next 7 days
 */
export function generateRandomEndDate(): string {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
  return endDate.toISOString();
}

/**
 * Extracts basic car info from an HTML car card
 */
export function extractBasicCarInfo(cardHtml: string) {
  // Extract title
  const titleMatch = cardHtml.match(/<div[^>]*class="vehicle-card__title"[^>]*>([\s\S]*?)<\/div>/);
  const title = titleMatch ? cleanHtml(titleMatch[1]) : '';
  
  // Extract price
  const priceMatch = cardHtml.match(/<div[^>]*class="vehicle-card__price"[^>]*>([\s\S]*?)<\/div>/);
  const priceText = priceMatch ? cleanHtml(priceMatch[1]) : '0';
  const priceNumMatch = priceText.match(/\d+(?:[.,]\d+)?/);
  const price = priceNumMatch ? parseFloat(priceNumMatch[0].replace(',', '.')) : 0;
  
  // Extract image URL
  const imgMatch = cardHtml.match(/<img[^>]*src="([^"]*)"[^>]*>/);
  const imageUrl = imgMatch ? imgMatch[1] : null;
  
  // Extract link
  const linkMatch = cardHtml.match(/<a[^>]*href="([^"]*)"[^>]*>/);
  const externalUrl = linkMatch ? 'https://www.openlane.eu' + linkMatch[1] : '';
  
  return { title, price, imageUrl, externalUrl };
}

/**
 * Extracts car details from the details section HTML
 */
export function extractCarDetails(detailsHtml: string) {
  const detailsRegex = /<div[^>]*class="vehicle-card__details-item"[^>]*>([\s\S]*?)<\/div>/g;
  let detailsMatches;
  let year = 0;
  let mileage = '';
  let fuel = '';
  let transmission = '';
  
  while ((detailsMatches = detailsRegex.exec(detailsHtml)) !== null) {
    const detailText = cleanHtml(detailsMatches[1]);
    if (/^\d{4}$/.test(detailText)) {
      year = parseInt(detailText);
    } else if (detailText.includes('km')) {
      mileage = detailText;
    } else if (['Diesel', 'Petrol', 'Electric', 'Hybrid'].some(f => detailText.includes(f))) {
      fuel = detailText;
    } else if (['Manual', 'Automatic'].some(t => detailText.includes(t))) {
      transmission = detailText;
    }
  }
  
  return { year, mileage, fuel, transmission };
}

/**
 * Extracts make and model from the car title
 */
export function extractMakeAndModel(title: string) {
  const titleParts = title.split(' ');
  const make = titleParts.length > 0 ? titleParts[0] : '';
  const model = titleParts.length > 1 ? titleParts.slice(1).join(' ') : '';
  
  return { make, model };
}
