
import json
import random
import asyncio
from datetime import datetime
import logging
import traceback

# Import utility functions
from utils.browser import setup_browser, handle_cookies_consent, take_debug_screenshot
from utils.error_handling import create_error_response
from openlane_extractor import extract_car_data

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def scrape_openlane():
    """
    Main function to scrape car data from OpenLane
    """
    logger.info("Starting OpenLane scraper")
    browser = None
    try:
        # Setup browser and page
        browser, page = await setup_browser()
        if not browser or not page:
            return create_error_response("Failed to initialize browser", "Browser Error")
        
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
            await take_debug_screenshot(page, "navigation-error")
            if browser:
                await browser.close()
            return create_error_response(str(e), "Navigation Error")
        
        # Handle cookie consent
        await handle_cookies_consent(page)
        
        # Wait for car listings with extended timeout and error handling
        logger.info("Waiting for car listings to load")
        try:
            await page.waitForSelector('.vehicle-list-item', {'visible': True, 'timeout': 30000})
            logger.info("Car listings loaded successfully")
        except Exception as e:
            logger.error(f"Failed to find car listings: {e}")
            logger.error(traceback.format_exc())
            await take_debug_screenshot(page, "debug-screenshot")
            if browser:
                await browser.close()
            return create_error_response(str(e), "Selector Error")
        
        # Extract car data
        cars = await extract_car_data(page)
        
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
        
        return create_error_response(str(general_e))

async def main():
    """
    Main entry point for the scraper
    """
    try:
        cars = await scrape_openlane()
        print(json.dumps(cars))
    except Exception as e:
        logger.error(f"Main function error: {e}")
        logger.error(traceback.format_exc())
        print(json.dumps(create_error_response(str(e), "Main Function Error")))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
