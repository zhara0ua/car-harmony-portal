
import logging
import asyncio
import random
from datetime import datetime
import traceback
from utils.browser import take_debug_screenshot, capture_page_html
from utils.error_handling import create_error_response

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def extract_car_data(page):
    """
    Extract car data from the OpenLane website
    """
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
            html = await capture_page_html(page)
            
            # Take a screenshot for debugging
            await take_debug_screenshot(page, "fallback-screenshot")
            
            # If no cars were found, return a fallback with error information
            return [{
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
        
        return cars
    except Exception as e:
        logger.error(f"Error extracting car data: {e}")
        logger.error(traceback.format_exc())
        return create_error_response(str(e), "Extraction Error")
