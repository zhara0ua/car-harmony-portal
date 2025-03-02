
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
    
    browser_args = [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
    ]
    if proxy:
        browser_args.append(f'--proxy-server={proxy}')
    
    try:
        logger.info("Launching browser...")
        browser = await launch({
            'headless': True,
            'args': browser_args,
            'ignoreHTTPSErrors': True,
            'timeout': 60000  # 60 seconds timeout for browser launch
        })
        logger.info("Browser launched successfully")
        
        page = await browser.newPage()
        await page.setUserAgent(user_agent)
        await page.setViewport({'width': 1920, 'height': 1080})
        
        # Set additional page configurations
        await page.setJavaScriptEnabled(True)
        await page.setRequestInterception(False)  # Don't interrupt requests
        
        # Add error handling for console messages
        page.on('console', lambda msg: logger.info(f'CONSOLE: {msg.text}'))
        page.on('pageerror', lambda err: logger.error(f'PAGE ERROR: {err}'))
        
        logger.info("Page created and configured successfully")
        
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
        
        # Try multiple possible selectors for cookie consent buttons
        cookie_button_selectors = [
            'button#onetrust-accept-btn-handler',
            '#accept-cookies',
            '.cookie-accept',
            '.cookie-consent-accept',
            'button[contains(text(), "Accept")]',
            'button.accept-cookies',
            'button.consent-accept',
            '#accept-all-cookies',
            'button[data-testid="cookie-accept"]',
            '.CookieBanner button:first-child',
            '#cookieAcceptButton'
        ]
        
        for selector in cookie_button_selectors:
            try:
                logger.info(f"Trying cookie selector: {selector}")
                cookieButton = await page.waitForSelector(selector, {'visible': True, 'timeout': 5000})
                if cookieButton:
                    logger.info(f"Found cookie consent button with selector: {selector}")
                    await cookieButton.click()
                    await asyncio.sleep(random.uniform(1, 2))
                    logger.info("Cookie consent handled")
                    return
            except Exception as e:
                logger.info(f"Selector {selector} not found: {e}")
        
        logger.info("No cookie consent button found with any selector")
    except Exception as e:
        logger.info(f"Error handling cookie consent: {e}")

async def take_debug_screenshot(page, filename):
    """
    Take a debug screenshot
    """
    try:
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        screenshot_path = f'/tmp/{filename}-{timestamp}.png'
        await page.screenshot({'path': screenshot_path, 'fullPage': True})
        logger.info(f"Debug screenshot saved to {screenshot_path}")
    except Exception as e:
        logger.error(f"Failed to take debug screenshot: {e}")

async def capture_page_html(page):
    """
    Capture the HTML content of the page
    """
    try:
        html = await page.content()
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        html_path = f'/tmp/openlane-html-{timestamp}.html'
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        logger.info(f"OpenLane HTML saved to {html_path}")
        logger.info(f"HTML content length: {len(html)} bytes")
        print(f"Received {len(html)} bytes of HTML from OpenLane")
        
        # Log a preview of the HTML
        html_preview = html[:500] + "..." if len(html) > 500 else html
        logger.info(f"HTML preview: {html_preview}")
        
        return html
    except Exception as e:
        logger.error(f"Failed to capture page HTML: {e}")
        logger.error(traceback.format_exc())
        return None
