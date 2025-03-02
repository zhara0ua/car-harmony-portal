
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
        '--window-size=1920,1080',
        '--blink-settings=imagesEnabled=true',  # Enable images to fully render the page
        '--disable-features=site-per-process',  # Disable site isolation for better compatibility
        '--disable-web-security',  # Disable CORS for better scraping
    ]
    if proxy:
        browser_args.append(f'--proxy-server={proxy}')
    
    try:
        logger.info("Launching browser with improved settings...")
        browser = await launch({
            'headless': True,
            'args': browser_args,
            'ignoreHTTPSErrors': True,
            'timeout': 90000,  # 90 seconds timeout for browser launch
            'defaultViewport': {'width': 1920, 'height': 1080}
        })
        logger.info("Browser launched successfully")
        
        page = await browser.newPage()
        await page.setUserAgent(user_agent)
        await page.setViewport({'width': 1920, 'height': 1080})
        
        # Set additional page configurations
        await page.setJavaScriptEnabled(True)
        await page.setRequestInterception(False)  # Don't interrupt requests to load everything
        
        # Increase timeouts for better page loading
        await page.setDefaultNavigationTimeout(120000)  # 2 minutes
        await page.setDefaultTimeout(60000)  # 1 minute
        
        # Add error handling for console messages
        page.on('console', lambda msg: logger.info(f'CONSOLE: {msg.text}'))
        page.on('pageerror', lambda err: logger.error(f'PAGE ERROR: {err}'))
        
        # Configure extra browser behaviors
        logger.info("Configuring browser for optimal scraping...")
        await page.evaluateOnNewDocument('''
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
            
            // Fix for broken navigator.languages property
            if (!navigator.languages) {
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
            }
            
            // Overwrite the `plugins` property to use a custom getter
            Object.defineProperty(navigator, 'plugins', {
                get: () => {
                    // Create fake plugins
                    const fakePlugins = {
                        length: 5,
                        item: (index) => { return fakePlugins[index]; },
                        0: { name: 'PDF Viewer', description: 'Portable Document Format' },
                        1: { name: 'Chrome PDF Viewer', description: 'Portable Document Format' },
                        2: { name: 'Chromium PDF Viewer', description: 'Portable Document Format' },
                        3: { name: 'Microsoft Edge PDF Viewer', description: 'Portable Document Format' },
                        4: { name: 'WebKit built-in PDF', description: 'Portable Document Format' }
                    };
                    return fakePlugins;
                }
            });
        ''')
        
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
            'button:contains("Accept")',
            'button:contains("Akzeptieren")',
            'button:contains("Accept All")',
            'button:contains("Alle akzeptieren")',
            'button:contains("I agree")',
            'button.accept-cookies',
            'button.consent-accept',
            '#accept-all-cookies',
            'button[data-testid="cookie-accept"]',
            '.CookieBanner button:first-child',
            '#cookieAcceptButton',
            'button.accept',
            'button.agree',
            'button.gdpr-accept-all',
            '#gdpr-banner-accept',
            'button[aria-label="accept cookies"]',
            'div[role="dialog"] button'
        ]
        
        for selector in cookie_button_selectors:
            try:
                logger.info(f"Trying cookie selector: {selector}")
                
                # Try JavaScript click for better compatibility
                const_exists = await page.evaluate(f'''
                    () => {{
                        const btn = document.querySelector('{selector}');
                        if (btn) {{
                            console.log('Found cookie button via JS:', '{selector}');
                            btn.click();
                            return true;
                        }}
                        return false;
                    }}
                ''')
                
                if const_exists:
                    logger.info(f"Clicked cookie consent button with JS selector: {selector}")
                    await asyncio.sleep(random.uniform(1, 2))
                    return
                
                # Traditional method as fallback
                try:
                    cookieButton = await page.waitForSelector(selector, {'visible': True, 'timeout': 3000})
                    if cookieButton:
                        logger.info(f"Found cookie consent button with selector: {selector}")
                        await cookieButton.click()
                        await asyncio.sleep(random.uniform(1, 2))
                        logger.info("Cookie consent handled")
                        return
                except Exception as e:
                    logger.debug(f"Traditional selector {selector} not found: {e}")
                
            except Exception as e:
                logger.debug(f"Selector {selector} not found: {e}")
        
        # If no selector matched, try clicking any button in a cookie-like container
        try:
            logger.info("Trying generic cookie banner detection...")
            clicked = await page.evaluate('''
                () => {
                    const keywords = ['cookie', 'consent', 'gdpr', 'privacy', 'cookies', 'akzeptieren', 'accept'];
                    const elements = document.querySelectorAll('div, section, aside');
                    
                    for (const el of elements) {
                        const text = el.textContent.toLowerCase();
                        if (keywords.some(keyword => text.includes(keyword))) {
                            console.log('Found potential cookie banner:', text.substring(0, 50));
                            
                            // Try to find buttons inside this element
                            const buttons = el.querySelectorAll('button, a.button, .btn, [role="button"]');
                            for (const btn of buttons) {
                                const btnText = btn.textContent.toLowerCase();
                                if (['accept', 'agree', 'ok', 'yes', 'akzeptieren', 'alle', 'all'].some(word => btnText.includes(word))) {
                                    console.log('Clicking button with text:', btnText);
                                    btn.click();
                                    return true;
                                }
                            }
                            
                            // If no specific button found but there's only one button, click it
                            if (buttons.length === 1) {
                                console.log('Clicking the only button in cookie banner');
                                buttons[0].click();
                                return true;
                            }
                        }
                    }
                    return false;
                }
            ''')
            
            if clicked:
                logger.info("Clicked a button in a potential cookie banner")
                await asyncio.sleep(random.uniform(1, 2))
                return
        except Exception as e:
            logger.info(f"Error during generic cookie banner detection: {e}")
        
        logger.info("No cookie consent button found with any selector")
    except Exception as e:
        logger.info(f"Error handling cookie consent: {e}")

async def wait_for_page_to_stabilize(page):
    """
    Wait for the page to fully load and stabilize
    """
    logger.info("Waiting for page to stabilize...")
    
    try:
        # First, wait for standard page load events
        await page.waitForNavigation({'waitUntil': 'networkidle0', 'timeout': 30000})
    except Exception as e:
        logger.info(f"Navigation timeout (expected in some cases): {e}")
    
    # Wait for network to be idle
    try:
        # Evaluate JS to check if the page has finished loading all resources
        await page.evaluate('''
            () => new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                    setTimeout(resolve, 10000); // Fallback if load never fires
                }
            })
        ''')
        
        logger.info("Page load event complete")
        
        # Wait a bit more for any post-load JS to execute
        await asyncio.sleep(5)
        
        # Scroll down and back up to trigger lazy loading
        logger.info("Scrolling page to trigger lazy loading...")
        await page.evaluate('''
            () => {
                return new Promise((resolve) => {
                    const totalHeight = document.body.scrollHeight;
                    let distance = 300;
                    let scrolled = 0;
                    
                    const timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        scrolled += distance;
                        
                        if (scrolled >= totalHeight) {
                            clearInterval(timer);
                            window.scrollTo(0, 0); // Scroll back to top
                            setTimeout(resolve, 1000);
                        }
                    }, 200);
                });
            }
        ''')
        
        logger.info("Page scrolling complete")
        
        # Final wait
        await asyncio.sleep(3)
        
    except Exception as e:
        logger.error(f"Error waiting for page to stabilize: {e}")
    
    logger.info("Page stabilization process complete")

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
        # First try with evaluate for more complete HTML
        logger.info("Capturing HTML content from page...")
        try:
            html = await page.evaluate('''
                () => {
                    return new XMLSerializer().serializeToString(document);
                }
            ''')
            logger.info("Captured HTML using XMLSerializer")
        except Exception as e:
            logger.warning(f"Error capturing HTML with XMLSerializer: {e}")
            # Fallback to standard content method
            html = await page.content()
            logger.info("Captured HTML using page.content() method")
        
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
        
        # Check if the HTML might be incomplete or have loading indicators
        if len(html) < 10000:
            logger.warning(f"HTML content is suspiciously small ({len(html)} bytes). It might be incomplete.")
        
        if "loading" in html.lower() or "please wait" in html.lower():
            logger.warning("HTML appears to contain loading indicators. Page might not be fully loaded.")
        
        return html
    except Exception as e:
        logger.error(f"Failed to capture page HTML: {e}")
        logger.error(traceback.format_exc())
        return None
