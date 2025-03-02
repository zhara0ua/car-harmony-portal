
import json
import random
import asyncio
from datetime import datetime
import logging
import traceback

# Import utility functions
from utils.browser import setup_browser, handle_cookies_consent, take_debug_screenshot, capture_page_html
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
    html_content = None
    try:
        # Setup browser and page with extended timeout
        logger.info("Setting up browser")
        browser, page = await setup_browser()
        if not browser or not page:
            logger.error("Failed to initialize browser")
            return create_error_response("Failed to initialize browser", "Browser Error")
        
        # Add random delay to simulate human behavior
        delay = random.uniform(2, 5)
        logger.info(f"Adding random delay of {delay} seconds")
        await asyncio.sleep(delay)
        
        # Set longer default timeout for all operations
        await page.setDefaultNavigationTimeout(120000)  # 2 minutes
        await page.setDefaultTimeout(60000)  # 1 minute
        
        # Go to the OpenLane auction website with extended timeout
        url = "https://www.openlane.eu/en/findcar"
        logger.info(f"Navigating to {url}")
        try:
            await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 120000})
            logger.info("Successfully loaded the page")
        except Exception as e:
            logger.error(f"Failed to navigate to {url}: {e}")
            logger.error(traceback.format_exc())
            await take_debug_screenshot(page, "navigation-error")
            
            # Capture HTML even if navigation had an error
            html_content = await capture_page_html(page)
            logger.info(f"Captured HTML content during navigation error: {len(html_content) if html_content else 'None'} bytes")
            
            error_response = create_error_response(f"Navigation Error: {str(e)}", "Navigation Error")
            if html_content:
                error_response["htmlContent"] = html_content  # Add directly to root for easier access
                if "debug" not in error_response:
                    error_response["debug"] = {}
                error_response["debug"]["htmlContent"] = html_content  # Also add to debug for compatibility
            
            if browser:
                await browser.close()
            return error_response
        
        # Take a screenshot to confirm page loaded
        await take_debug_screenshot(page, "page-loaded")
        
        # ALWAYS capture HTML content for debugging - this is critical
        html_content = await capture_page_html(page)
        logger.info(f"Captured initial HTML content: {len(html_content) if html_content else 'None'} bytes")
        
        # Print part of the HTML for debugging
        if html_content:
            logger.info(f"HTML content head: {html_content[:500]}...")
            logger.info(f"HTML content contains car-related terms: {'car' in html_content.lower() or 'vehicle' in html_content.lower()}")
        
        # Handle cookie consent with multiple attempts
        logger.info("Handling cookie consent")
        for attempt in range(3):
            try:
                await handle_cookies_consent(page)
                break
            except Exception as e:
                logger.warning(f"Cookie consent handling attempt {attempt+1} failed: {e}")
                await asyncio.sleep(2)
        
        # Add longer wait to ensure page is fully loaded after cookie interaction
        logger.info("Waiting for page to stabilize after cookie handling")
        await asyncio.sleep(5)
        
        # Refresh HTML content after cookie handling
        html_content = await capture_page_html(page)
        logger.info(f"Captured HTML content after cookie handling: {len(html_content) if html_content else 'None'} bytes")
        
        # Check if page contains expected content
        logger.info("Checking if page contains expected content")
        pageContent = await page.content()
        if "vehicle" not in pageContent.lower() and "auction" not in pageContent.lower() and "car" not in pageContent.lower():
            logger.error("Page does not contain expected content")
            await take_debug_screenshot(page, "unexpected-content")
            error_response = create_error_response("Page does not contain expected content", "Content Error")
            if html_content:
                error_response["htmlContent"] = html_content  # Add directly to root
                if "debug" not in error_response:
                    error_response["debug"] = {}
                error_response["debug"]["htmlContent"] = html_content  # Also add to debug
            return error_response
        
        # Wait for car listings with multiple selectors and extended timeout
        logger.info("Waiting for car listings to load")
        car_listing_selectors = [
            '.vehicle-list-item',
            '.vehicle-card',
            '.car-listing',
            '.auction-item',
            'article.vehicle',
            'div[data-vehicle-id]',
            '.vehicle-tiles',
            '.tile',
            '.car-tile',
            '.product',
            '.car-item'
        ]
        
        car_listing_found = False
        for selector in car_listing_selectors:
            try:
                logger.info(f"Trying selector: {selector}")
                await page.waitForSelector(selector, {'visible': True, 'timeout': 30000})
                logger.info(f"Car listings found with selector: {selector}")
                car_listing_found = True
                break
            except Exception as e:
                logger.warning(f"Selector {selector} not found: {e}")
        
        if not car_listing_found:
            logger.error("Failed to find any car listings with any selector")
            await take_debug_screenshot(page, "no-listings-found")
            
            # Update HTML content - it might have changed
            html_content = await capture_page_html(page)
            logger.info(f"Updated HTML content after selector search: {len(html_content) if html_content else 'None'} bytes")
            
            error_response = create_error_response("No car listings found on page", "Selector Error")
            if html_content:
                error_response["htmlContent"] = html_content  # Add directly to root
                if "debug" not in error_response:
                    error_response["debug"] = {}
                error_response["debug"]["htmlContent"] = html_content  # Also add to debug
            
            if browser:
                await browser.close()
            return error_response
        
        # Add additional delay to ensure all dynamic content is loaded
        logger.info("Waiting for dynamic content to fully load")
        await asyncio.sleep(5)
        
        # Take a screenshot before extraction
        await take_debug_screenshot(page, "before-extraction")
        
        # Capture final HTML content just before extraction
        final_html_content = await capture_page_html(page)
        if final_html_content:
            html_content = final_html_content  # Update with the latest version
            logger.info(f"Captured final HTML content before extraction: {len(html_content)} bytes")
        
        # Extract car data
        logger.info("Starting car data extraction")
        cars = await extract_car_data(page)
        logger.info(f"Extraction complete, found {len(cars) if isinstance(cars, list) else '0'} cars")
        
        # Close the browser
        if browser:
            await browser.close()
            logger.info("Browser closed")
        
        # Ensure we're returning a properly structured response with HTML content
        response_data = {}
        
        if isinstance(cars, dict):
            # If cars is already a dictionary (like an error response)
            response_data = cars
        else:
            # Otherwise, create a proper response structure
            response_data = {
                "cars": cars,
                "success": True,
                "message": f"Successfully extracted {len(cars)} cars"
            }
        
        # IMPORTANT: Always add HTML content to the response, in multiple places for redundancy
        if html_content:
            # Add HTML content directly to the root object for easier access
            response_data["htmlContent"] = html_content
            
            # Also add to debug section for backward compatibility
            if "debug" not in response_data:
                response_data["debug"] = {}
            response_data["debug"]["htmlContent"] = html_content
        
        return response_data
    except Exception as general_e:
        logger.error(f"General error during scraping: {general_e}")
        logger.error(traceback.format_exc())
        
        error_response = create_error_response(str(general_e))
        
        # If we captured HTML content earlier, add it to the error response
        if html_content:
            # Add HTML content directly to the root object for easier access
            error_response["htmlContent"] = html_content
            
            # Also add to debug section for backward compatibility
            if "debug" not in error_response:
                error_response["debug"] = {}
            error_response["debug"]["htmlContent"] = html_content
        
        try:
            if browser:
                await browser.close()
                logger.info("Browser closed after error")
        except:
            logger.error("Failed to close browser after error")
        
        return error_response

async def main():
    """
    Main entry point for the scraper
    """
    try:
        result = await scrape_openlane()
        
        # Verify HTML content is in the response
        if "htmlContent" in result:
            print(f"HTML content is present in the main response ({len(result['htmlContent'])} bytes)")
        elif "debug" in result and "htmlContent" in result["debug"]:
            print(f"HTML content is present in debug ({len(result['debug']['htmlContent'])} bytes)")
        else:
            print("No HTML content in the response")
        
        print(json.dumps(result))
    except Exception as e:
        logger.error(f"Main function error: {e}")
        logger.error(traceback.format_exc())
        error_response = create_error_response(str(e), "Main Function Error")
        print(json.dumps(error_response))

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
