
import random
import asyncio
import logging
from pyppeteer import launch
from datetime import datetime
import os
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

async def setup_browser():
    """
    Setup and launch the browser with appropriate configurations
    """
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
        logger.info("Launching browser...")
        browser = await launch({
            'headless': True,
            'args': browser_args,
            'ignoreHTTPSErrors': True
        })
        logger.info("Browser launched successfully")
        
        page = await browser.newPage()
        await page.setUserAgent(user_agent)
        await page.setViewport({'width': 1920, 'height': 1080})
        logger.info("Page created successfully")
        
        return browser, page
    except Exception as e:
        logger.error(f"Failed to setup browser: {e}")
        logger.error(traceback.format_exc())
        return None, None

async def handle_cookies_consent(page):
    """
    Handle cookie consent popup if it appears
    """
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

async def take_debug_screenshot(page, filename):
    """
    Take a debug screenshot
    """
    try:
        await page.screenshot({'path': f'/tmp/{filename}.png'})
        logger.info(f"Debug screenshot saved to /tmp/{filename}.png")
    except Exception as e:
        logger.error(f"Failed to take debug screenshot: {e}")

async def capture_page_html(page):
    """
    Capture the HTML content of the page
    """
    try:
        html = await page.content()
        logger.info(f"Page HTML (first 500 chars): {html[:500]}...")
        return html
    except Exception as e:
        logger.error(f"Failed to capture page HTML: {e}")
        return None
