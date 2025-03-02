
import json
import random
import asyncio
from datetime import datetime
import logging
import traceback

# Import utility functions
from utils.browser import setup_browser, handle_cookies_consent, wait_for_page_to_stabilize, take_debug_screenshot, capture_page_html
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
    html_attempts = []
    
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
            html_attempts.append({
                "stage": "navigation_error",
                "html_length": len(html_content) if html_content else 0,
                "timestamp": datetime.now().isoformat()
            })
            logger.info(f"Captured HTML content during navigation error: {len(html_content) if html_content else 'None'} bytes")
            
            error_response = create_error_response(f"Navigation Error: {str(e)}", "Navigation Error")
            if html_content:
                # Add the HTML content in multiple places for redundancy
                error_response["htmlContent"] = html_content
                error_response["raw_html"] = html_content
                if "debug" not in error_response:
                    error_response["debug"] = {}
                error_response["debug"]["htmlContent"] = html_content
                error_response["debug"]["html_attempts"] = html_attempts
            
            if browser:
                await browser.close()
            return error_response
        
        # Take a screenshot to confirm page loaded
        await take_debug_screenshot(page, "page-loaded")
        
        # Initial HTML capture
        initial_html = await capture_page_html(page)
        html_attempts.append({
            "stage": "initial_load",
            "html_length": len(initial_html) if initial_html else 0,
            "timestamp": datetime.now().isoformat()
        })
        logger.info(f"Captured initial HTML content: {len(initial_html) if initial_html else 'None'} bytes")
        html_content = initial_html  # Store the first HTML capture
        
        # Handle cookie consent with multiple attempts
        logger.info("Handling cookie consent")
        for attempt in range(3):
            try:
                await handle_cookies_consent(page)
                break
            except Exception as e:
                logger.warning(f"Cookie consent handling attempt {attempt+1} failed: {e}")
                await asyncio.sleep(2)
        
        # Wait after cookie handling
        await asyncio.sleep(3)
        
        # Try another method to handle cookies if needed
        try:
            logger.info("Trying additional cookie handling methods...")
            await page.evaluate('''
                () => {
                    // Try to find and click all cookie-related buttons
                    document.querySelectorAll('button').forEach(button => {
                        const text = button.textContent.toLowerCase();
                        if (text.includes('accept') || text.includes('agree') || text.includes('cookie') || 
                            text.includes('consent') || text.includes('ok') || text.includes('allow')) {
                            console.log("Clicking potential cookie button: " + text);
                            button.click();
                        }
                    });
                }
            ''')
        except Exception as e:
            logger.info(f"Additional cookie handling failed: {e}")
        
        # Capture HTML after cookie handling
        post_cookie_html = await capture_page_html(page)
        html_attempts.append({
            "stage": "post_cookie",
            "html_length": len(post_cookie_html) if post_cookie_html else 0,
            "timestamp": datetime.now().isoformat()
        })
        logger.info(f"Captured HTML after cookie handling: {len(post_cookie_html) if post_cookie_html else 'None'} bytes")
        if post_cookie_html and len(post_cookie_html) > len(html_content):
            html_content = post_cookie_html  # Update if better
        
        # Wait for the page to fully load and stabilize
        await wait_for_page_to_stabilize(page)
        
        # Capture HTML after stabilization
        post_stabilize_html = await capture_page_html(page)
        html_attempts.append({
            "stage": "post_stabilize",
            "html_length": len(post_stabilize_html) if post_stabilize_html else 0,
            "timestamp": datetime.now().isoformat()
        })
        logger.info(f"Captured HTML after stabilization: {len(post_stabilize_html) if post_stabilize_html else 'None'} bytes")
        if post_stabilize_html and len(post_stabilize_html) > len(html_content):
            html_content = post_stabilize_html  # Update if better
        
        # Try direct DOM manipulation to get past possible overlays/modals
        try:
            logger.info("Attempting to close any overlays or modals...")
            await page.evaluate('''
                () => {
                    // Close modals, overlays, or popups that might be blocking content
                    const closeElements = document.querySelectorAll('button.close, .modal-close, .dialog-close, .popup-close, .overlay-close, button[aria-label="Close"]');
                    closeElements.forEach(el => {
                        console.log("Closing overlay element");
                        el.click();
                    });
                    
                    // Try to remove any blocking overlays
                    document.querySelectorAll('.modal, .overlay, .popup, [role="dialog"]').forEach(el => {
                        if (el.style.display !== 'none') {
                            console.log("Removing overlay element");
                            el.remove();
                        }
                    });
                }
            ''')
            await asyncio.sleep(2)
        except Exception as e:
            logger.info(f"Error handling overlays: {e}")
        
        # Check if page contains expected content
        logger.info("Checking if page contains expected content")
        pageContent = await page.content()
        if "vehicle" not in pageContent.lower() and "auction" not in pageContent.lower() and "car" not in pageContent.lower():
            logger.warning("Page does not contain expected vehicle-related keywords")
            await take_debug_screenshot(page, "unexpected-content")
            
            # Try to reload the page
            logger.info("Reloading the page to try again...")
            try:
                await page.reload({'waitUntil': 'networkidle0', 'timeout': 60000})
                await asyncio.sleep(5)
                logger.info("Page reloaded successfully")
                
                # Capture HTML after reload
                post_reload_html = await capture_page_html(page)
                html_attempts.append({
                    "stage": "post_reload",
                    "html_length": len(post_reload_html) if post_reload_html else 0,
                    "timestamp": datetime.now().isoformat()
                })
                logger.info(f"Captured HTML after reload: {len(post_reload_html) if post_reload_html else 'None'} bytes")
                if post_reload_html and len(post_reload_html) > len(html_content):
                    html_content = post_reload_html  # Update if better
            except Exception as e:
                logger.error(f"Error reloading page: {e}")
        
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
            '.car-item',
            '.vehicle-card-wrapper', 
            '.vehicle-list-container .item',
            '.car-tile-container',
            '.auction-item-wrapper',
            '.product-card',
            '.grid-item.vehicle',
            '.search-results-item',
            'article.vehicle-listing',
            '.car-card',
            '.listing-item',
        ]
        
        car_listing_found = False
        for selector in car_listing_selectors:
            try:
                logger.info(f"Trying selector: {selector}")
                await page.waitForSelector(selector, {'visible': True, 'timeout': 5000})
                logger.info(f"Car listings found with selector: {selector}")
                car_listing_found = True
                break
            except Exception as e:
                logger.debug(f"Selector {selector} not found: {e}")
        
        if not car_listing_found:
            logger.warning("Failed to find any car listings with standard selectors")
            await take_debug_screenshot(page, "no-listings-found")
            
            # Try to look for any divs that might contain car listings
            logger.info("Trying to find car listings with generic patterns...")
            try:
                car_patterns_found = await page.evaluate('''
                    () => {
                        const carKeywords = ['car', 'vehicle', 'auto', 'auction', 'lot', 'model', 'make'];
                        const candidates = [];
                        
                        // Look for divs containing car-related keywords in class names
                        document.querySelectorAll('div[class], article[class], section[class]').forEach(el => {
                            if (el.className) {
                                const className = el.className.toLowerCase();
                                if (carKeywords.some(word => className.includes(word))) {
                                    candidates.push({
                                        tag: el.tagName,
                                        class: el.className,
                                        children: el.children.length
                                    });
                                    console.log("Found potential car container:", el.tagName, el.className, "with", el.children.length, "children");
                                }
                            }
                        });
                        
                        // Look for repeating structures with similar children counts
                        const parentElements = {};
                        document.querySelectorAll('div, section, article, ul').forEach(el => {
                            if (el.children.length >= 3) {
                                const key = el.tagName + (el.className ? '-' + el.className : '');
                                if (!parentElements[key]) {
                                    parentElements[key] = 0;
                                }
                                parentElements[key]++;
                            }
                        });
                        
                        // Find parents with multiple similar children
                        const repeatingPatterns = Object.entries(parentElements)
                            .filter(([_, count]) => count >= 2)
                            .map(([key, count]) => ({ pattern: key, count }));
                            
                        console.log("Repeating patterns:", JSON.stringify(repeatingPatterns));
                        
                        return {
                            candidates,
                            repeatingPatterns
                        };
                    }
                ''')
                logger.info(f"Car pattern analysis: {json.dumps(car_patterns_found)}")
            except Exception as e:
                logger.error(f"Error analyzing car patterns: {e}")
        
        # Add additional delay to ensure all dynamic content is loaded
        logger.info("Final waiting period for dynamic content...")
        await asyncio.sleep(5)
        
        # Take a screenshot before extraction
        await take_debug_screenshot(page, "before-extraction")
        
        # Capture final HTML content just before extraction
        final_html_content = await capture_page_html(page)
        html_attempts.append({
            "stage": "final",
            "html_length": len(final_html_content) if final_html_content else 0,
            "timestamp": datetime.now().isoformat()
        })
        if final_html_content:
            if len(final_html_content) > len(html_content):
                html_content = final_html_content  # Update if better
            logger.info(f"Captured final HTML content before extraction: {len(final_html_content)} bytes")
        
        # Try one last method to get the most complete HTML
        try:
            logger.info("Trying HTML serialization method for the most complete content...")
            complete_html = await page.evaluate('''
                () => {
                    return new XMLSerializer().serializeToString(document.doctype) + 
                           new XMLSerializer().serializeToString(document.documentElement);
                }
            ''')
            if complete_html and len(complete_html) > len(html_content):
                logger.info(f"Got better HTML from serialization method: {len(complete_html)} bytes vs {len(html_content)} bytes")
                html_content = complete_html
                html_attempts.append({
                    "stage": "serialization",
                    "html_length": len(complete_html),
                    "timestamp": datetime.now().isoformat()
                })
        except Exception as e:
            logger.warning(f"Error with serialization method: {e}")
        
        # Extract car data
        logger.info("Starting car data extraction")
        cars = await extract_car_data(page)
        logger.info(f"Extraction complete, found {len(cars) if isinstance(cars, list) else '0'} cars")
        
        # Close the browser
        if browser:
            await browser.close()
            logger.info("Browser closed")
        
        # Find the largest HTML content from all attempts
        best_html = html_content
        for attempt in html_attempts:
            if attempt.get("html_length", 0) > len(best_html):
                # We would need the actual HTML content, not just the length, to use it
                # This is just a check to make sure we're logging properly
                logger.info(f"Found a larger HTML capture in stage {attempt['stage']}: {attempt['html_length']} bytes")
        
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
            # Add HTML content directly to the root object for easier access (using different keys for redundancy)
            response_data["htmlContent"] = html_content
            response_data["raw_html"] = html_content  # Add another key for redundancy
            
            # Also add to debug section for backward compatibility
            if "debug" not in response_data:
                response_data["debug"] = {}
            response_data["debug"]["htmlContent"] = html_content
            response_data["debug"]["raw_html"] = html_content  # Add another key for redundancy
            response_data["debug"]["html_attempts"] = html_attempts
        
        return response_data
    except Exception as general_e:
        logger.error(f"General error during scraping: {general_e}")
        logger.error(traceback.format_exc())
        
        error_response = create_error_response(str(general_e))
        
        # If we captured HTML content earlier, add it to the error response
        if html_content:
            # Add HTML content directly to the root object for easier access (using different keys for redundancy)
            error_response["htmlContent"] = html_content
            error_response["raw_html"] = html_content  # Add another key for redundancy
            
            # Also add to debug section for backward compatibility
            if "debug" not in error_response:
                error_response["debug"] = {}
            error_response["debug"]["htmlContent"] = html_content
            error_response["debug"]["raw_html"] = html_content  # Add another key for redundancy
            error_response["debug"]["html_attempts"] = html_attempts
        
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
        elif "raw_html" in result:
            print(f"Raw HTML content is present in the main response ({len(result['raw_html'])} bytes)")
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
