const logger = require('../logger')(__filename)

module.exports = async (page) => {
  const MAX_TIMES_TO_SCROLL = 25
  const TIMEOUT_BETWEEN_SCROLLS = 500

  for (let i = 0; i < MAX_TIMES_TO_SCROLL; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))

    const hasReachedEnd = await page.evaluate(() => {
      return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 200)
    })

    if (hasReachedEnd) {
      return
    }

    await new Promise(resolve => setTimeout(resolve, TIMEOUT_BETWEEN_SCROLLS))
    logger.info(`scrolling to page bottom (${i + 1})`)
  }

  logger.warn('page bottom not found')
}
