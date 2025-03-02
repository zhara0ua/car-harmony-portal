
from datetime import datetime
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_error_response(error_message, prefix="Scraping Error"):
    """
    Creates a standardized error response object
    """
    logger.error(f"{prefix}: {error_message}")
    logger.error(traceback.format_exc())
    
    return [{
        'external_id': f'ol-{int(datetime.now().timestamp())}-1',
        'title': f'{prefix}: {str(error_message)[:50]}',
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
