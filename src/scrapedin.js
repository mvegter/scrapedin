const puppeteer = require('puppeteer')
const login = require('./login')
const profile = require('./profile/profile')
const company = require('./company/company')
const logger = require('./logger')(__filename)

const saveBrowserCookies = async (browser, cookiesPath) => {
  if (!cookiesPath) return
  try {
    const pages = await browser.pages()
    if (pages.length > 0) {
      const pageCookies = await pages[0].cookies()
      const fs = require('fs')
      fs.writeFileSync(cookiesPath, JSON.stringify(pageCookies, null, 2))
      logger.info('cookies saved to: ' + cookiesPath)
    }
  } catch (e) {
    logger.warn('failed to save cookies: ' + e.message)
  }
}

module.exports = async ({ cookies, email, password, isHeadless, hasToLog, hasToGetContactInfo, cookiesPath, puppeteerArgs, puppeteerAuthenticate, endpoint } = { isHeadless: true, hasToLog: false }) => {
  if (!hasToLog) {
    logger.stopLogging()
  }
  logger.info('initializing')

  let browser
  if (endpoint) {
    browser = await puppeteer.connect({
      browserWSEndpoint: endpoint
    })
  } else {
    const args = Object.assign({ headless: isHeadless, args: ['--no-sandbox'] }, puppeteerArgs)
    browser = await puppeteer.launch(args)
  }

  if (cookies) {
    logger.info('using cookies, login will be bypassed')
  } else if (email && password) {
    logger.info('email and password was provided, we\'re going to login...')

    try {
      const loginResult = await login(browser, email, password, logger)
      // Only save cookies if login fully completed (no 2FA challenge)
      if (loginResult && !loginResult.hadChallenge && cookiesPath) {
        await saveBrowserCookies(browser, cookiesPath)
      }
    } catch (e) {
      if (!endpoint) {
        await browser.close()
      }
      throw e
    }
  } else {
    logger.warn('email/password and cookies wasn\'t provided, only public data will be collected')
  }

  return (url, waitMs) => url.includes('/school/') || url.includes('/company/') ? company(browser, cookies, url, waitMs, hasToGetContactInfo, puppeteerAuthenticate) : profile(browser, cookies, url, waitMs, hasToGetContactInfo, puppeteerAuthenticate)
}
