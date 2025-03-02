
import json
import random
import asyncio
from pyppeteer import launch
from datetime import datetime
import os
import re
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define user agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36",
]

# Get proxy list from environment variable (comma-separated list)
def get_proxies():
    proxy_list_str = os.environ.get('PROXY_LIST', '')
    if not proxy_list_str:
        logger.warning("No proxies found in environment variables. Running without proxies.")
        return []
    
    return [proxy.strip() for proxy in proxy_list_str.split(',') if proxy.strip()]

async def scrape_openlane():
    logger.info("Starting OpenLane scraper")
    proxies = get_proxies()
    proxy = random.choice(proxies) if proxies else None
    user_agent = random.choice(USER_AGENTS)
    
    logger.info(f"Using user agent: {user_agent}")
    if proxy:
        logger.info(f"Using proxy: {proxy}")
    
    browser_args = ['--no-sandbox', '--disable-setuid-sandbox']
    if proxy:
        browser_args.append(f'--proxy-server={proxy}')
    
    try:
        browser = await launch({
            'headless': True,
            'args': browser_args,
            'ignoreHTTPSErrors': True
        })
        
        page = await browser.newPage()
        await page.setUserAgent(user_agent)
        await page.setViewport({'width': 1920, 'height': 1080})
        
        # Add random delay to simulate human behavior
        await asyncio.sleep(random.uniform(1, 3))
        
        # Go to the OpenLane auction website
        url = "https://www.openlane.eu/en/vehicles"
        logger.info(f"Navigating to {url}")
        await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 60000})
        
        # Accept cookies if the popup appears
        try:
            logger.info("Looking for cookie consent button")
            cookie_button = await page.waitForSelector('button#onetrust-accept-btn-handler', {'visible': True, 'timeout': 5000})
            if cookie_button:
                logger.info("Clicking cookie consent button")
                await cookie_button.click()
                await asyncio.sleep(random.uniform(0.5, 1.5))
        except Exception as e:
            logger.info(f"No cookie consent button found or error: {e}")
        
        # Wait for car listings to appear
        logger.info("Waiting for car listings to load")
        await page.waitForSelector('.vehicle-list-item', {'visible': True, 'timeout': 30000})
        
        # Extract car data
        logger.info("Extracting car data")
        cars = await page.evaluate('''() => {
            const cars = [];
            const carElements = document.querySelectorAll('.vehicle-list-item');
            
            carElements.forEach(car => {
                try {
                    const titleElement = car.querySelector('.vehicle-list-item-title a');
                    const title = titleElement ? titleElement.textContent.trim() : '';
                    const url = titleElement ? titleElement.href : '';
                    const id = url.split('/').pop() || '';
                    
                    const priceElement = car.querySelector('.vehicle-list-item-price');
                    const priceText = priceElement ? priceElement.textContent.trim() : '';
                    const price = priceText.replace(/[^0-9]/g, '');
                    
                    const imageElement = car.querySelector('.vehicle-list-item-image img');
                    const image = imageElement ? imageElement.src : '';
                    
                    const detailsElements = car.querySelectorAll('.vehicle-list-item-details div');
                    let year = null;
                    let mileage = null;
                    let fuelType = null;
                    let transmission = null;
                    
                    detailsElements.forEach(detail => {
                        const text = detail.textContent.trim();
                        if (/^\\d{4}$/.test(text)) {
                            year = parseInt(text);
                        } else if (text.includes('km')) {
                            mileage = text;
                        } else if (['Petrol', 'Diesel', 'Electric', 'Hybrid'].some(fuel => text.includes(fuel))) {
                            fuelType = text;
                        } else if (['Manual', 'Automatic'].some(trans => text.includes(trans))) {
                            transmission = text;
                        }
                    });
                    
                    const locationElement = car.querySelector('.vehicle-list-item-location');
                    const location = locationElement ? locationElement.textContent.trim() : null;
                    
                    cars.push({
                        external_id: id,
                        title,
                        price: parseInt(price),
                        year,
                        mileage,
                        fuel_type: fuelType,
                        transmission,
                        location,
                        image_url: image,
                        external_url: url,
                        source: 'openlane'
                    });
                } catch (e) {
                    console.error('Error parsing car element:', e);
                }
            });
            
            return cars;
        }''')
        
        logger.info(f"Found {len(cars)} cars")
        
        await browser.close()
        return cars
    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        try:
            await browser.close()
        except:
            pass
        raise e

async def main():
    try:
        cars = await scrape_openlane()
        print(json.dumps(cars))
    except Exception as e:
        logger.error(f"Main function error: {e}")
        print(json.dumps([]))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
