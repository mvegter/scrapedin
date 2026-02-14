const logger = require('../logger')(__filename)

const clickAll = async (page) => {
  const clicked = await page.evaluate(() => {
    let count = 0
    // Only click expandable text buttons (inline expand, not navigation)
    const expandButtons = document.querySelectorAll('[data-testid="expandable-text-button"]')
    expandButtons.forEach(btn => { btn.click(); count++ })
    return count
  })

  if (clicked > 0) {
    logger.info(`clicked ${clicked} show-more buttons`)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

module.exports = { clickAll }
