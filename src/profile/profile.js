const openPage = require('../openPage')
const scrollToPageBottom = require('./scrollToPageBottom')
const seeMoreButtons = require('./seeMoreButtons')
const contactInfo = require('./contactInfo')
const cleanProfileData = require('./cleanProfileData')

const logger = require('../logger')(__filename)

const extractProfileData = async (page) => {
  return page.evaluate(() => {
    const txt = (el) => el ? (el.textContent || '').trim() : ''

    const byViewName = (name) => document.querySelector(`[data-view-name="${name}"]`)

    const getSection = (viewName) => {
      const el = byViewName(viewName)
      if (!el) return null
      return el.querySelector('section') || el.closest('section')
    }

    // Get items from a section. For sections without ul/li, items are divs
    // found after the h2 heading: h2.parent.nextSibling > div > div > div
    const getSectionItems = (viewName) => {
      const section = getSection(viewName)
      if (!section) return []
      const ul = section.querySelector('ul')
      if (ul) return [...ul.querySelectorAll(':scope > li')]
      const h2 = section.querySelector('h2')
      if (!h2) return []
      const afterH2 = h2.parentElement.nextElementSibling
      if (!afterH2) return []
      const itemDivs = afterH2.querySelectorAll(':scope > div > div > div')
      return [...itemDivs].filter(d => d.querySelectorAll('p').length > 0)
    }

    // Profile top card: name is in h2, headline/location in p tags
    const titleName = document.title.replace(' | LinkedIn', '').trim()
    const mainLevel = byViewName('profile-main-level')
    const topSection = mainLevel ? (mainLevel.querySelector('section') || mainLevel.closest('section')) : null
    const nameH2 = topSection ? topSection.querySelector('h2') : null
    const photoImg = document.querySelector('img[src*="profile-displayphoto"]')

    const profileName = nameH2 ? txt(nameH2) : titleName
    let headline = ''
    let location = ''

    if (topSection) {
      const allP = [...topSection.querySelectorAll('p')]
      headline = txt(allP[0])
      for (const p of allP) {
        const t = txt(p)
        if (t.includes(',') && !t.includes('at ') && !t.includes('\xB7')) {
          location = t
          break
        }
      }
    }

    const profile = {
      name: profileName,
      headline,
      location,
      connections: '',
      imageurl: photoImg ? photoImg.getAttribute('src') || '' : ''
    }

    // Experience: uses LazyColumn with company groups containing ul > li
    const positions = []
    const expSection = getSection('profile-card-experience')
    if (expSection) {
      const lazyCol = expSection.querySelector('[data-component-type]') || expSection
      const groups = [...lazyCol.children]

      groups.forEach(group => {
        const ul = group.querySelector('ul')
        if (!ul) return

        // Company info is in p tags before the ul
        const allPs = group.querySelectorAll('p')
        const beforeUlPs = []
        for (const p of allPs) {
          if (ul.contains(p)) break
          beforeUlPs.push(p)
        }
        const companyName = txt(beforeUlPs[0])
        const companyLink = group.querySelector('a[href*="/company/"]')
        const companyUrl = companyLink ? companyLink.getAttribute('href') : ''
        const companyLocation = txt(beforeUlPs[2])

        const lis = [...ul.querySelectorAll(':scope > li')]
        lis.forEach(li => {
          const ps = [...li.querySelectorAll('div[role="button"] p')]
          const descEl = li.querySelector('[data-testid="expandable-text-box"]')
          const dateStr = txt(ps[2])
          const dateRange = dateStr.split('\xB7')[0].trim()
          const dateParts = dateRange.split(' - ')
          positions.push({
            title: txt(ps[0]),
            companyName,
            link: companyUrl,
            url: companyUrl,
            location: companyLocation,
            description: descEl ? txt(descEl) : '',
            date: dateRange,
            date1: dateParts[0] ? dateParts[0].trim() : '',
            date2: dateParts[1] ? dateParts[1].trim() : ''
          })
        })
      })
    }

    // Education
    const eduItems = getSectionItems('profile-card-education')
    const educations = eduItems.map(item => {
      const ps = [...item.querySelectorAll('p')]
      const link = item.querySelector('a[href*="/school/"]') ||
        item.closest('div')?.parentElement?.querySelector('a[href*="/school/"]')
      return {
        title: txt(ps[0]),
        degree: txt(ps[1]),
        fieldOfStudy: txt(ps[1]),
        url: link ? link.getAttribute('href') : '',
        date1: ps[2] ? txt(ps[2]).split('\u2013')[0].trim() : '',
        date2: ps[2] ? (txt(ps[2]).split('\u2013')[1] || '').trim() : '',
        description: ''
      }
    })

    // Skills
    const skillItems = getSectionItems('profile-card-skills')
    const skills = skillItems.map(item => {
      const ps = [...item.querySelectorAll('p')]
      return { title: txt(ps[0]), count: '' }
    })

    // Languages
    const langItems = getSectionItems('profile-card-languages')
    const languages = langItems.map(item => {
      const ps = [...item.querySelectorAll('p')]
      return { name: txt(ps[0]), proficiency: txt(ps[1]) }
    })

    // Projects
    const projItems = getSectionItems('profile-card-projects')
    const projects = projItems.map(item => {
      const ps = [...item.querySelectorAll('p')]
      const descEl = item.querySelector('[data-testid="expandable-text-box"]')
      const link = item.querySelector('a[href*="http"]')
      return {
        name: txt(ps[0]),
        date: txt(ps[1]),
        description: descEl ? txt(descEl) : '',
        link: link ? link.getAttribute('href') : ''
      }
    })

    // Certifications
    const certItems = getSectionItems('profile-card-licenses-and-certifications')
    const accomplishments = certItems.map(item => {
      const ps = [...item.querySelectorAll('p')]
      return { title: txt(ps[0]), count: '', items: [] }
    })

    return {
      profile,
      about: { text: '' },
      positions,
      educations,
      skills,
      recommendations: { givenCount: '0', receivedCount: '0', given: [], received: [] },
      accomplishments,
      courses: [],
      languages,
      projects,
      peopleAlsoViewed: [],
      volunteerExperience: [],
      contact: []
    }
  })
}

module.exports = async (browser, cookies, url, waitTimeToScrapMs = 500, hasToGetContactInfo = false, puppeteerAuthenticate = undefined) => {
  logger.info(`starting scraping url: ${url}`)

  const page = await openPage({ browser, cookies, url, puppeteerAuthenticate })

  // Wait for the SDUI profile to fully hydrate
  await page.waitForFunction(() => {
    return document.querySelector('[data-view-name="profile-card-experience"]')
  }, { timeout: 30000 })
    .catch(() => {
      logger.warn('profile content did not fully render in time')
    })

  logger.info('scrolling page to the bottom')
  await scrollToPageBottom(page)

  // Wait for lazy-loaded sections to render after scrolling
  await new Promise((resolve) => { setTimeout(resolve, 2000) })

  // Scroll again in case new content was loaded
  await scrollToPageBottom(page)
  await new Promise((resolve) => { setTimeout(resolve, 1000) })

  await seeMoreButtons.clickAll(page)

  // Final wait for content to settle
  await new Promise((resolve) => { setTimeout(resolve, 1000) })

  const rawProfile = await extractProfileData(page)

  if (hasToGetContactInfo) {
    rawProfile.contact = await contactInfo(page) || []
  }

  await page.close()
  logger.info(`finished scraping url: ${url}`)

  const cleanedProfile = cleanProfileData(rawProfile)
  return cleanedProfile
}
