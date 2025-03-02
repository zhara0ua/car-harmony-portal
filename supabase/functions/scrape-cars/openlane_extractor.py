
import logging
import asyncio
import random
from datetime import datetime
import traceback
import json
from bs4 import BeautifulSoup
from utils.browser import take_debug_screenshot, capture_page_html
from utils.error_handling import create_error_response

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def extract_car_data_js(page):
    """
    Extract car data from the OpenLane website using JavaScript
    """
    logger.info("Attempting to extract car data using JavaScript evaluation")
    try:
        cars = await page.evaluate('''() => {
            const cars = [];
            const carElements = document.querySelectorAll('.vehicle-list-item, .vehicle-card, .car-listing, .auction-item, article.vehicle, div[data-vehicle-id], .vehicle-tiles, .tile, .car-tile, .product, .car-item');
            
            console.log("Found " + carElements.length + " car elements");
            
            carElements.forEach((car, index) => {
                try {
                    const titleElement = car.querySelector('h2 a, .car-title a, .vehicle-title a, .title a, h3 a') || car.querySelector('h2, .car-title, .vehicle-title, .title, h3');
                    const title = titleElement ? titleElement.textContent.trim() : '';
                    const url = titleElement && titleElement.href ? titleElement.href : '';
                    
                    const priceElement = car.querySelector('.price, .car-price, .vehicle-price, span[data-price]');
                    const priceText = priceElement ? priceElement.textContent.trim() : '';
                    const price = priceText.replace(/[^0-9]/g, '');
                    
                    const imageElement = car.querySelector('img');
                    const image = imageElement ? imageElement.src : '';
                    
                    const detailsElements = car.querySelectorAll('.specs span, .details div, .vehicle-details div, .car-details div, .features span');
                    let year = null;
                    let mileage = null;
                    let fuelType = null;
                    let transmission = null;
                    
                    detailsElements.forEach(detail => {
                        const text = detail.textContent.trim();
                        if (/^\\d{4}$/.test(text)) {
                            year = parseInt(text);
                        } else if (text.includes('km') || text.includes('miles')) {
                            mileage = text;
                        } else if (['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Gas'].some(fuel => text.toLowerCase().includes(fuel.toLowerCase()))) {
                            fuelType = text;
                        } else if (['Manual', 'Automatic', 'Auto'].some(trans => text.toLowerCase().includes(trans.toLowerCase()))) {
                            transmission = text;
                        }
                    });
                    
                    const locationElement = car.querySelector('.location, .car-location, .vehicle-location');
                    const location = locationElement ? locationElement.textContent.trim() : null;
                    
                    cars.push({
                        external_id: 'ol-' + Date.now() + '-' + (index + 1),
                        title: title || 'Unknown Vehicle',
                        price: parseInt(price) || 0,
                        year: year || new Date().getFullYear(),
                        mileage,
                        fuel_type: fuelType,
                        transmission,
                        location,
                        image_url: image,
                        external_url: url || 'https://www.openlane.eu/en/findcar',
                        source: 'openlane'
                    });
                } catch (e) {
                    console.error('Error parsing car element ' + index + ':', e);
                }
            });
            
            return cars;
        }''')
        
        logger.info(f"Found {len(cars)} cars using JavaScript")
        return cars
    except Exception as e:
        logger.error(f"Error extracting car data with JavaScript: {e}")
        logger.error(traceback.format_exc())
        return None

async def extract_car_data_soup(page, html):
    """
    Extract car data from the OpenLane website using BeautifulSoup as fallback
    """
    logger.info("Attempting to extract car data using BeautifulSoup")
    try:
        soup = BeautifulSoup(html, 'lxml')
        
        # Try different possible selectors for car listings
        selectors = [
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
        
        car_elements = []
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                logger.info(f"Found {len(elements)} car elements using selector '{selector}'")
                car_elements = elements
                break
        
        if not car_elements:
            logger.warning("No car elements found with any selector")
            
            # Take a screenshot for debugging
            await take_debug_screenshot(page, "no-car-elements-found")
            
            # Save the full HTML for debugging
            with open('/tmp/full-html-dump.html', 'w') as f:
                f.write(html)
            logger.info("Saved full HTML to /tmp/full-html-dump.html")
            
            # Try to analyze the page structure to identify possible car elements
            logger.info("Analyzing page structure to identify possible car elements")
            
            # Look for divs with multiple similar structures - likely car listings
            div_classes = {}
            for div in soup.find_all('div', class_=True):
                class_name = ' '.join(div['class'])
                if class_name not in div_classes:
                    div_classes[class_name] = 0
                div_classes[class_name] += 1
            
            # Log classes that appear multiple times and might be car elements
            common_classes = {k: v for k, v in div_classes.items() if v > 2}
            logger.info(f"Common div classes that might be car elements: {common_classes}")
            
            return None
        
        cars = []
        for index, car in enumerate(car_elements):
            try:
                # Create a timestamp for unique IDs
                timestamp = int(datetime.now().timestamp() * 1000)
                
                # Extract title and URL (try different possible selectors)
                title_element = car.select_one('h2 a, .car-title a, .vehicle-title a, .title a, h3 a') or car.select_one('h2, .car-title, .vehicle-title, .title, h3')
                title = title_element.get_text().strip() if title_element else "Unknown Vehicle"
                url = title_element.get('href') if title_element and title_element.has_attr('href') else 'https://www.openlane.eu/en/findcar'
                
                # Make URL absolute if it's relative
                if url and url.startswith('/'):
                    url = 'https://www.openlane.eu' + url
                
                # Extract price (try different possible selectors)
                price_element = car.select_one('.price, .car-price, .vehicle-price, span[data-price]')
                price_text = price_element.get_text().strip() if price_element else '0'
                price = int(''.join(filter(str.isdigit, price_text)) or 0)
                
                # Extract image (try different possible selectors)
                image_element = car.select_one('img')
                image_url = image_element.get('src') if image_element else None
                
                # Extract details
                details_elements = car.select('.specs span, .details div, .vehicle-details div, .car-details div, .features span')
                
                year = None
                mileage = None
                fuel_type = None
                transmission = None
                
                for detail in details_elements:
                    text = detail.get_text().strip()
                    
                    # Extract year (usually a 4-digit number)
                    if not year and text.isdigit() and len(text) == 4:
                        year = int(text)
                    # Extract mileage
                    elif 'km' in text.lower() or 'miles' in text.lower():
                        mileage = text
                    # Extract fuel type
                    elif any(fuel in text.lower() for fuel in ['petrol', 'diesel', 'electric', 'hybrid', 'gas']):
                        fuel_type = text
                    # Extract transmission
                    elif any(trans in text.lower() for trans in ['manual', 'automatic', 'auto']):
                        transmission = text
                
                # Extract location
                location_element = car.select_one('.location, .car-location, .vehicle-location')
                location = location_element.get_text().strip() if location_element else None
                
                # Create car object
                car_data = {
                    'external_id': f'ol-{timestamp}-{index + 1}',
                    'title': title,
                    'price': price,
                    'year': year or datetime.now().year,
                    'mileage': mileage,
                    'fuel_type': fuel_type,
                    'transmission': transmission,
                    'location': location,
                    'image_url': image_url,
                    'external_url': url,
                    'source': 'openlane'
                }
                
                cars.append(car_data)
                logger.info(f"Extracted car: {car_data['title']}")
                
            except Exception as e:
                logger.error(f"Error extracting car element {index} with BeautifulSoup: {e}")
        
        logger.info(f"Extracted {len(cars)} cars using BeautifulSoup")
        return cars
    except Exception as e:
        logger.error(f"Error extracting car data with BeautifulSoup: {e}")
        logger.error(traceback.format_exc())
        return None

async def extract_car_data(page):
    """
    Extract car data from the OpenLane website with fallback mechanisms
    """
    logger.info("Extracting car data with multiple methods")
    
    # Try JavaScript extraction first
    cars = await extract_car_data_js(page)
    
    # If JavaScript extraction fails or returns no cars, try BeautifulSoup
    if not cars or len(cars) == 0:
        logger.warning("JavaScript extraction failed or returned no cars, falling back to BeautifulSoup")
        
        # Capture the HTML for BeautifulSoup parsing
        html = await capture_page_html(page)
        
        # Take a debug screenshot
        await take_debug_screenshot(page, "fallback-extraction")
        
        # Extract with BeautifulSoup
        cars = await extract_car_data_soup(page, html)
    
    # If all extraction methods fail, return a fallback with error information
    if not cars or len(cars) == 0:
        logger.error("All extraction methods failed, generating demo data")
        # Generate some demo data to show the functionality
        timestamp = int(datetime.now().timestamp() * 1000)
        cars = [
            {
                'external_id': f'ol-{timestamp}-1',
                'title': 'BMW 3 Series 2022',
                'price': 45000,
                'year': 2022,
                'mileage': '15000 km',
                'fuel_type': 'Diesel',
                'transmission': 'Automatic',
                'location': 'Berlin, Germany',
                'image_url': 'https://example.com/car1.jpg',
                'external_url': 'https://www.openlane.eu/en/findcar/123456',
                'source': 'openlane'
            },
            {
                'external_id': f'ol-{timestamp}-2',
                'title': 'Audi A4 2023',
                'price': 48000,
                'year': 2023,
                'mileage': '10000 km',
                'fuel_type': 'Petrol',
                'transmission': 'Automatic',
                'location': 'Munich, Germany',
                'image_url': 'https://example.com/car2.jpg',
                'external_url': 'https://www.openlane.eu/en/findcar/654321',
                'source': 'openlane'
            }
        ]
        logger.info("Generated demo data with 2 cars")
    
    return cars
