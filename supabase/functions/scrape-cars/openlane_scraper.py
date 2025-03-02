
import json
import random
import asyncio
from pyppeteer import launch
from datetime import datetime
import os
import re
import logging
import traceback

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
    browser = None
    try:
        proxies = get_proxies()
        proxy = random.choice(proxies) if proxies else None
        user_agent = random.choice(USER_AGENTS)
        
        logger.info(f"Using user agent: {user_agent}")
        if proxy:
            logger.info(f"Using proxy: {proxy}")
        
        browser_args = ['--no-sandbox', '--disable-setuid-sandbox']
        if proxy:
            browser_args.append(f'--proxy-server={proxy}')
        
        # Add error handling for browser launch
        try:
            logger.info("Launching browser...")
            browser = await launch({
                'headless': True,
                'args': browser_args,
                'ignoreHTTPSErrors': True
            })
            logger.info("Browser launched successfully")
        except Exception as e:
            logger.error(f"Failed to launch browser: {e}")
            logger.error(traceback.format_exc())
            return []
        
        # Create a new page with timeout handling
        try:
            logger.info("Creating new page...")
            page = await browser.newPage()
            await page.setUserAgent(user_agent)
            await page.setViewport({'width': 1920, 'height': 1080})
            logger.info("Page created successfully")
        except Exception as e:
            logger.error(f"Failed to create page: {e}")
            logger.error(traceback.format_exc())
            if browser:
                await browser.close()
            return []
        
        # Add random delay to simulate human behavior
        delay = random.uniform(1, 3)
        logger.info(f"Adding random delay of {delay} seconds")
        await asyncio.sleep(delay)
        
        # Go to the OpenLane auction website with extended timeout
        url = "https://www.openlane.eu/en/vehicles"
        logger.info(f"Navigating to {url}")
        try:
            await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 90000})
            logger.info("Successfully loaded the page")
        except Exception as e:
            logger.error(f"Failed to navigate to {url}: {e}")
            logger.error(traceback.format_exc())
            if browser:
                await browser.close()
            return []
        
        # Attempt to accept cookies if the popup appears
        try:
            logger.info("Looking for cookie consent button")
            cookieButton = await page.waitForSelector('button#onetrust-accept-btn-handler', {'visible': True, 'timeout': 5000})
            if cookieButton:
                logger.info("Clicking cookie consent button")
                await cookieButton.click()
                await asyncio.sleep(random.uniform(0.5, 1.5))
                logger.info("Cookie consent handled")
        except Exception as e:
            logger.info(f"No cookie consent button found or error: {e}")
        
        # Wait for car listings with extended timeout and error handling
        logger.info("Waiting for car listings to load")
        try:
            await page.waitForSelector('.vehicle-list-item', {'visible': True, 'timeout': 30000})
            logger.info("Car listings loaded successfully")
        except Exception as e:
            logger.error(f"Failed to find car listings: {e}")
            logger.error(traceback.format_exc())
            # Take a screenshot for debugging
            try:
                await page.screenshot({'path': '/tmp/debug-screenshot.png'})
                logger.info("Debug screenshot saved to /tmp/debug-screenshot.png")
            except:
                logger.error("Failed to take debug screenshot")
            
            # Grab the page HTML for debugging
            try:
                html = await page.content()
                logger.info(f"Page HTML (first 500 chars): {html[:500]}...")
            except:
                logger.error("Failed to capture page HTML")
            
            if browser:
                await browser.close()
            return []
        
        # Extract car data with improved error handling
        logger.info("Extracting car data")
        try:
            cars = await page.evaluate('''() => {
                const cars = [];
                const carElements = document.querySelectorAll('.vehicle-list-item');
                
                console.log("Found " + carElements.length + " car elements");
                
                carElements.forEach((car, index) => {
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
                            external_id: 'ol-' + Date.now() + '-' + (index + 1),
                            title,
                            price: parseInt(price) || 0,
                            year: year || new Date().getFullYear(),
                            mileage,
                            fuel_type: fuelType,
                            transmission,
                            location,
                            image_url: image,
                            external_url: url || 'https://www.openlane.eu/en/vehicles',
                            source: 'openlane'
                        });
                    } catch (e) {
                        console.error('Error parsing car element ' + index + ':', e);
                    }
                });
                
                return cars;
            }''')
            
            logger.info(f"Found {len(cars)} cars")
            
            # Validate the extracted data
            if not cars or len(cars) == 0:
                logger.warning("No cars extracted, falling back to manual HTML parsing")
                # Fall back to a simpler extraction method
                html = await page.content()
                
                # Take a screenshot for debugging
                try:
                    await page.screenshot({'path': '/tmp/fallback-screenshot.png'})
                    logger.info("Fallback screenshot saved to /tmp/fallback-screenshot.png")
                except:
                    logger.error("Failed to take fallback screenshot")
                
                # If no cars were found, return a fallback with error information
                cars = [{
                    'external_id': f'ol-{int(datetime.now().timestamp())}-1',
                    'title': 'Parsing Error - Please check logs',
                    'price': 0,
                    'year': datetime.now().year,
                    'mileage': None,
                    'fuel_type': None,
                    'transmission': None,
                    'location': None,
                    'image_url': None,
                    'external_url': 'https://www.openlane.eu/en/vehicles',
                    'source': 'openlane'
                }]
            
        except Exception as e:
            logger.error(f"Error extracting car data: {e}")
            logger.error(traceback.format_exc())
            cars = [{
                'external_id': f'ol-{int(datetime.now().timestamp())}-1',
                'title': f'Extraction Error: {str(e)[:50]}',
                'price': 0,
                'year': datetime.now().year,
                'mileage': None,
                'fuel_type': None,
                'transmission': None,
                'location': None,
                'image_url': None,
                'external_url': 'https://www.openlane.eu/en/vehicles',
                'source': 'openlane'
            }]
        
        # Close the browser
        if browser:
            await browser.close()
            logger.info("Browser closed")
        
        return cars
    except Exception as general_e:
        logger.error(f"General error during scraping: {general_e}")
        logger.error(traceback.format_exc())
        try:
            if browser:
                await browser.close()
                logger.info("Browser closed after error")
        except:
            logger.error("Failed to close browser after error")
        
        # Return a structured error object
        return [{
            'external_id': f'ol-{int(datetime.now().timestamp())}-1',
            'title': f'Scraping Error: {str(general_e)[:50]}',
            'price': 0,
            'year': datetime.now().year,
            'mileage': None,
            'fuel_type': None,
            'transmission': None,
            'location': None,
            'image_url': None,
            'external_url': 'https://www.openlane.eu/en/vehicles',
            'source': 'openlane'
        }]

async def main():
    try:
        cars = await scrape_openlane()
        print(json.dumps(cars))
    except Exception as e:
        logger.error(f"Main function error: {e}")
        logger.error(traceback.format_exc())
        print(json.dumps([{
            'external_id': f'ol-{int(datetime.now().timestamp())}-1',
            'title': f'Main Function Error: {str(e)[:50]}',
            'price': 0,
            'year': datetime.now().year,
            'mileage': None,
            'fuel_type': None,
            'transmission': None,
            'location': None,
            'image_url': None,
            'external_url': 'https://www.openlane.eu/en/vehicles',
            'source': 'openlane'
        }]))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
