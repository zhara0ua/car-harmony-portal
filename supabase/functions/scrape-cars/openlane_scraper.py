
import asyncio
import json
import random
import time
from typing import List, Dict, Any, Optional
import os

import aiohttp
from pyppeteer import launch
from pyppeteer_stealth import stealth

# List of user agents to rotate through
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 OPR/77.0.4054.254",
]

# Load proxies from environment variable
def get_proxies() -> List[str]:
    # Try to get proxies from environment variable
    proxy_list_str = os.environ.get('PROXY_LIST', '')
    if proxy_list_str:
        return [p.strip() for p in proxy_list_str.split(',') if p.strip()]
    
    # Default to a list of free proxies (note: free proxies may not be reliable)
    # In a production environment, use a paid proxy service and store credentials securely
    return [
        "http://localhost:8080",  # placeholder - replace with actual proxies
    ]

class OpenlaneScraper:
    def __init__(self, base_url: str = "https://www.openlane.eu"):
        self.base_url = base_url
        self.proxies = get_proxies()
        
    def get_random_user_agent(self) -> str:
        return random.choice(USER_AGENTS)
    
    def get_random_proxy(self) -> Optional[str]:
        if not self.proxies:
            return None
        return random.choice(self.proxies)
    
    async def scrape_listings(self, max_pages: int = 5) -> List[Dict[str, Any]]:
        """Scrape car listings from Openlane"""
        all_cars = []
        browser = None
        
        try:
            # Launch browser with headless mode
            browser = await launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            
            for page_num in range(1, max_pages + 1):
                # Create a new page for each request to use fresh context
                page = await browser.newPage()
                
                # Apply stealth mode to make automation less detectable
                await stealth(page)
                
                # Set a random user agent
                user_agent = self.get_random_user_agent()
                await page.setUserAgent(user_agent)
                
                # Get a random proxy
                proxy = self.get_random_proxy()
                if proxy:
                    await page.setExtraHTTPHeaders({
                        'Proxy-Authorization': f'Basic {proxy}'
                    })
                
                # Visit the page
                url = f"{self.base_url}/inventory?page={page_num}"
                await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 60000})
                
                # Wait for car listings to load
                await page.waitForSelector('.vehicle-card', {'timeout': 10000})
                
                # Extract car data
                cars_on_page = await page.evaluate('''() => {
                    const cards = Array.from(document.querySelectorAll('.vehicle-card'));
                    return cards.map(card => {
                        const idElement = card.querySelector('[data-vehicle-id]');
                        const externalId = idElement ? idElement.getAttribute('data-vehicle-id') : '';
                        
                        const titleElement = card.querySelector('.vehicle-title');
                        const title = titleElement ? titleElement.textContent.trim() : '';
                        
                        const priceElement = card.querySelector('.price');
                        const priceText = priceElement ? priceElement.textContent.trim() : '0';
                        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
                        
                        const yearElement = card.querySelector('.vehicle-year');
                        const year = yearElement ? parseInt(yearElement.textContent.trim()) : null;
                        
                        const mileageElement = card.querySelector('.vehicle-mileage');
                        const mileage = mileageElement ? mileageElement.textContent.trim() : null;
                        
                        const detailElements = card.querySelectorAll('.vehicle-details .detail');
                        let fuelType = null;
                        let transmission = null;
                        
                        detailElements.forEach(detail => {
                            const text = detail.textContent.trim().toLowerCase();
                            if (text.includes('diesel') || text.includes('petrol') || text.includes('electric') || text.includes('hybrid')) {
                                fuelType = detail.textContent.trim();
                            } else if (text.includes('manual') || text.includes('automatic')) {
                                transmission = detail.textContent.trim();
                            }
                        });
                        
                        const locationElement = card.querySelector('.vehicle-location');
                        const location = locationElement ? locationElement.textContent.trim() : null;
                        
                        const imageElement = card.querySelector('.vehicle-image img');
                        const imageUrl = imageElement ? imageElement.getAttribute('src') : null;
                        
                        const linkElement = card.querySelector('a.vehicle-link');
                        const externalUrl = linkElement ? linkElement.getAttribute('href') : '';
                        
                        return {
                            external_id: externalId,
                            title,
                            price,
                            year,
                            mileage,
                            fuel_type: fuelType,
                            transmission,
                            location,
                            image_url: imageUrl,
                            external_url: externalUrl,
                            source: 'openlane'
                        };
                    });
                }''')
                
                # Add cars from this page to our results
                all_cars.extend([car for car in cars_on_page if car['external_id']])
                
                # Close the page to free resources
                await page.close()
                
                # Random delay between requests to avoid detection
                await asyncio.sleep(random.uniform(2, 5))
                
                # If we didn't get any cars, we've probably reached the end
                if not cars_on_page:
                    break
                    
        except Exception as e:
            print(f"Error scraping Openlane: {str(e)}")
        finally:
            if browser:
                await browser.close()
                
        return all_cars
        
async def main():
    scraper = OpenlaneScraper()
    cars = await scraper.scrape_listings()
    
    # Print JSON output to be captured by the TypeScript function
    print(json.dumps(cars))
    
if __name__ == "__main__":
    asyncio.run(main())
