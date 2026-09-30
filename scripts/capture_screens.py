import asyncio
from playwright.async_api import async_playwright

targets = [
    ("https://blackwaterleaf.com/", "01_home_hero.png"),
    ("https://blackwaterleaf.com/explore", "02_explore_index.png"),
    ("https://blackwaterleaf.com/knowledge", "03_knowledge.png"),
    ("https://blackwaterleaf.com/community", "04_community_feed.png"),
    ("https://blackwaterleaf.com/marketplace", "05_marketplace_partners.png"),
    ("https://blackwaterleaf.com/flow/foto", "06_flow_foto.png"),
    ("https://blackwaterleaf.com/flow/live", "07_flow_live.png"),
    ("https://blackwaterleaf.com/profile", "08_profile_signedout.png"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        )
        context = await browser.new_context(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        for url, name in targets:
            page = await context.new_page()
            try:
                print(f"Navigating to {url} ...")
                await page.goto(url, wait_until="networkidle", timeout=45000)
                await asyncio.sleep(2)
                out_path = f"/home/ubuntu/blackleaf/video/intro/assets/screens/{name}"
                await page.screenshot(path=out_path)
                print(f"Saved {out_path}")
            except Exception as e:
                print(f"Error {name}: {e}")
            finally:
                await page.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
