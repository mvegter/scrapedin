const openPage = require('./openPage')
const logger = require('./logger')(__filename)
const pkg = require('./package')

const ACCEPT_COOKIES_SELECTORS = [
  'button:has-text("Accept")',
  'button:has-text("Alle accepteren")',
  'button[action-type="ACCEPT"]',
  '.cookie-consent-v2__button--accept',
  '#artdeco-global-alert-container button:has-text("Accept")'
]

const acceptCookies = async (page) => {
  for (const selector of ACCEPT_COOKIES_SELECTORS) {
    try {
      const btn = await page.$(selector)
      if (btn) {
        await btn.click()
        await new Promise((r) => setTimeout(r, 1000))
        return
      }
    } catch {
      // selector might not exist, try next
    }
  }
  // Fallback: find any button with Accept text
  try {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.trim().toLowerCase() === 'accept'
      )
      if (btn) btn.click()
    })
    await new Promise((r) => setTimeout(r, 1000))
  } catch {
    // ignore
  }
}

const fillField = async (page, fieldValue) => {
  // LinkedIn renders two sets of inputs: hidden (CSS-only, not visible) and visible.
  // We find all <input> elements matching the autocomplete attribute, then pick
  // the first one that is actually visible (has non-zero dimensions).
  const autocomplete = fieldValue === 'username webauthn' ? 'username' : 'current-password'

  const visibleInput = await page.evaluate((auto, val) => {
    const inputs = Array.from(document.querySelectorAll(`input[autocomplete="${auto}"]`))
    for (const input of inputs) {
      const rect = input.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const style = window.getComputedStyle(input)
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          input.focus()
          input.value = ''
          return true
        }
      }
    }
    return false
  }, autocomplete, fieldValue)

  if (visibleInput) {
    await page.keyboard.type(fieldValue, { delay: 50 })
  }
}

const clickSignIn = async (page) => {
  // Find the "Sign in" button, excluding "Sign in with Apple" etc.
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    const signInBtn = buttons.find(
      (b) => {
        const text = b.textContent.trim().toLowerCase()
        return (text === 'sign in' || text === 'inloggen' || text === 'aanmelden') &&
          !text.includes('apple')
      }
    )
    if (signInBtn) {
      signInBtn.click()
      return true
    }
    return false
  })
}

const LOGGED_IN_PATHS = ['/feed', '/mynetwork', '/in/']

module.exports = async (browser, email, password) => {
  const url = 'https://www.linkedin.com/login'
  const page = await openPage({ browser, url })
  logger.info(`logging at: ${url}`)

  // Accept cookie consent if present
  await acceptCookies(page)
  await new Promise((r) => setTimeout(r, 1000))

  // Fill in email field
  await fillField(page, 'username webauthn')
  await new Promise((r) => setTimeout(r, 500))

  // Fill in password field
  await fillField(page, 'current-password')
  await new Promise((r) => setTimeout(r, 500))

  await clickSignIn(page)

  let hadChallenge = false

  try {
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 })
  } catch {
    // Navigation timeout is expected — the page may not navigate if already on login
  }

  // Wait for either the feed/mynetwork or challenge page
  const maxWaitMs = 120000
  const start = Date.now()
  let resolved = false
  while (Date.now() - start < maxWaitMs && !resolved) {
    const currentUrl = page.url()
    if (LOGGED_IN_PATHS.some((p) => currentUrl.includes(p))) {
      logger.info('logged in, redirected to: ' + currentUrl)
      resolved = true
      break
    }
    if (currentUrl.includes('/checkpoint')) {
      if (!hadChallenge) {
        logger.warn('2FA challenge detected, please complete the verification in the browser window (waiting up to 2 minutes)...')
        hadChallenge = true
      }
      await new Promise((r) => setTimeout(r, 2000))
      continue
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  if (!resolved) {
    const finalUrl = page.url()
    logger.warn('successful login element was not found, url: ' + finalUrl)

    const emailError = await page.evaluate(() => {
      const e = document.querySelector('div[error-for=username], #error-for-username')
      if (!e) { return false }
      const style = window.getComputedStyle(e)
      return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    })

    const passwordError = await page.evaluate(() => {
      const e = document.querySelector('div[error-for=password], #error-for-password')
      if (!e) { return false }
      const style = window.getComputedStyle(e)
      return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
    })

    if (emailError) {
      logger.info('wrong username element found')
      await page.close()
      return Promise.reject(new Error(`linkedin: invalid username: ${email}`))
    }

    if (passwordError) {
      logger.info('wrong password element found')
      await page.close()
      return Promise.reject(new Error('linkedin: invalid password'))
    }

    logger.error('could not find any element to retrieve a proper error')
    await page.close()
    return Promise.reject(new Error(`${pkg.name} ${pkg.version} login is not working, please report: ${pkg.bugs.url}`))
  }

  await page.close()
  return { hadChallenge }
}
