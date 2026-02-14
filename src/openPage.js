const AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

module.exports = async ({ browser, cookies, url, puppeteerAuthenticate }) => {
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(60000)

  if (cookies) {
    await page.setCookie(...cookies)
  }
  await page.setUserAgent(AGENT)
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8' })
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  if (puppeteerAuthenticate) {
    await page.authenticate(puppeteerAuthenticate)
  }

  await page.goto(url, { waitUntil: 'load' })
  return page
}
