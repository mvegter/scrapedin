const openPage = require('../openPage')
const scrollToPageBottom = require('./scrollToPageBottom')
const seeMoreButtons = require('./seeMoreButtons')
const contactInfo = require('./contactInfo')
const cleanProfileData = require('./cleanProfileData')

const logger = require('../logger')(__filename)

const extractProfileData = async (page) => {
  return page.evaluate(() => {
    const txt = (el) => el ? (el.textContent || '').trim() : ''

    const findSection = (headingText) => {
      const sections = document.querySelectorAll('section')
      for (const s of sections) {
        const h2 = s.querySelector('h2')
        if (h2 && h2.textContent.trim().startsWith(headingText)) return s
      }
      return null
    }

    const getContentDivs = (section) => {
      if (!section) return []
      const h2 = section.querySelector('h2')
      if (!h2) return []
      const content = h2.parentElement?.nextElementSibling
      if (!content) return []
      return [...content.querySelectorAll(':scope > div')].filter(d => d.querySelector('p'))
    }

    // Profile top card
    const sections = document.querySelectorAll('section')
    let topSection = null
    for (const s of sections) {
      const h2 = s.querySelector('h2')
      if (h2 && ['0 notifications', 'Suggested for you', 'Analytics', 'Activity'].includes(h2.textContent.trim())) continue
      if (s.textContent.trim().length > 200) { topSection = s; break }
    }

    const nameH1 = document.querySelector('h1')
    const profileName = nameH1 ? txt(nameH1) : document.title.replace(' | LinkedIn', '').trim()
    let headline = ''
    let location = ''
    if (topSection) {
      const allP = [...topSection.querySelectorAll('p')]
      headline = txt(allP[0])
      for (const p of allP) {
        const t = txt(p)
        if (t.includes(',') && !t.includes('at ') && !t.includes('\u00B7') && !t.includes('follow')) {
          location = t
          break
        }
      }
    }
    const photoImg = document.querySelector('img[src*="profile-displayphoto"]')
    const profile = {
      name: profileName,
      headline,
      location,
      connections: '',
      imageurl: photoImg ? photoImg.getAttribute('src') || '' : ''
    }

    // Experience
    const positions = []
    const expSection = findSection('Experience')
    if (expSection) {
      const companyGroups = expSection.querySelectorAll('[componentkey^="entity-collection"]')
      companyGroups.forEach(group => {
        const allP = [...group.querySelectorAll('p')].filter(p => txt(p).length > 0)
        if (allP.length === 0) return
        const companyName = txt(allP[0])
        const companyLink = group.querySelector('a[href*="/company/"]')
        const companyUrl = companyLink ? companyLink.getAttribute('href') : ''

        const positionLis = group.querySelectorAll('ul > li')
        if (positionLis.length > 0) {
          positionLis.forEach(li => {
            const liPs = [...li.querySelectorAll('p')].filter(p => txt(p).length > 0)
            if (liPs.length === 0) return
            const descEl = li.querySelector('[data-testid="expandable-text-box"]')
            let dateStr = ''
            for (let i = 1; i < liPs.length; i++) {
              const t = txt(liPs[i])
              if (t.includes('\u00B7') || /\d{4}/.test(t)) { dateStr = t; break }
            }
            const dateRange = dateStr.split('\u00B7')[0].trim()
            const dateParts = dateRange.split(' - ')
            positions.push({
              title: txt(liPs[0]),
              companyName,
              link: companyUrl,
              url: companyUrl,
              location: '',
              description: descEl ? txt(descEl) : '',
              date: dateRange,
              date1: dateParts[0] ? dateParts[0].trim() : '',
              date2: dateParts[1] ? dateParts[1].trim() : ''
            })
          })
        } else {
          const descEl = group.querySelector('[data-testid="expandable-text-box"]')
          let dateStr = ''
          for (let i = 1; i < allP.length; i++) {
            const t = txt(allP[i])
            if (t.includes('\u00B7') || /\d{4}/.test(t.split(' ')[0])) { dateStr = t; break }
          }
          const dateRange = dateStr.split('\u00B7')[0].trim()
          const dateParts = dateRange.split(' - ')
          positions.push({
            title: txt(allP[3]) || txt(allP[1]),
            companyName,
            link: companyUrl,
            url: companyUrl,
            location: txt(allP[2]) || '',
            description: descEl ? txt(descEl) : '',
            date: dateRange,
            date1: dateParts[0] ? dateParts[0].trim() : '',
            date2: dateParts[1] ? dateParts[1].trim() : ''
          })
        }
      })
    }

    // Education
    const educations = []
    const eduSection = findSection('Education')
    const eduDivs = getContentDivs(eduSection)
    eduDivs.forEach(div => {
      const ps = [...div.querySelectorAll('p')].filter(p => txt(p).length > 0)
      if (ps.length === 0) return
      const schoolLink = div.querySelector('a[href*="/school/"]')
      const url = schoolLink ? schoolLink.getAttribute('href') : ''
      const dateStr = txt(ps[2]) || ''
      const dateParts = dateStr.split('\u2013')
      educations.push({
        title: txt(ps[0]),
        degree: txt(ps[1]) || '',
        fieldOfStudy: txt(ps[1]) || '',
        url,
        date1: dateParts[0] ? dateParts[0].trim() : '',
        date2: dateParts[1] ? dateParts[1].trim() : '',
        description: ''
      })
    })

    // Skills
    const skills = []
    const skillsSection = findSection('Skills')
    if (skillsSection) {
      const allSectionP = [...skillsSection.querySelectorAll('p')].filter(p => txt(p).length > 0)
      for (let i = 0; i < allSectionP.length; i += 2) {
        const name = txt(allSectionP[i])
        if (name && !name.includes('Show all') && !name.includes('Private')) {
          skills.push({ title: name, count: '' })
        }
      }
    }

    // Languages
    const languages = []
    const langSection = findSection('Languages')
    if (langSection) {
      const langDivs = getContentDivs(langSection)
      langDivs.forEach(div => {
        const ps = [...div.querySelectorAll('p')].filter(p => txt(p).length > 0)
        for (let i = 0; i < ps.length; i += 2) {
          const n = txt(ps[i])
          const pr = ps[i + 1] ? txt(ps[i + 1]) : ''
          if (n) languages.push({ name: n, proficiency: pr })
        }
      })
    }

    // Projects
    const projects = []
    const projSection = findSection('Projects')
    const projDivs = getContentDivs(projSection)
    projDivs.forEach(div => {
      const ps = [...div.querySelectorAll('p')].filter(p => txt(p).length > 0)
      if (ps.length === 0) return
      const descEl = div.querySelector('[data-testid="expandable-text-box"]')
      const link = div.querySelector('a[href*="http"]')
      projects.push({
        name: txt(ps[0]),
        date: txt(ps[1]) || '',
        description: descEl ? txt(descEl) : '',
        link: link ? link.getAttribute('href') : ''
      })
    })

    // Certifications
    const accomplishments = []
    const certSection = findSection('Licenses')
    const certDivs = getContentDivs(certSection)
    certDivs.forEach(div => {
      const ps = [...div.querySelectorAll('p')].filter(p => txt(p).length > 0)
      if (ps.length > 0) accomplishments.push({ title: txt(ps[0]), count: '', items: [] })
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

  // Check for authwall (expired session)
  const isAuthwall = await page.evaluate(() =>
    window.location.href.includes('/authwall') || document.title.toLowerCase().includes('inschrijven')
  )
  if (isAuthwall) {
    await page.close()
    throw new Error('authwall: LinkedIn session expired, re-authentication required')
  }

  // Accept cookie consent if present
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent.trim().toLowerCase() === 'accept'
    )
    if (btn) btn.click()
  })
  await new Promise((r) => setTimeout(r, 2000))

  // Wait for sections to appear (profile content is SDUI rendered)
  await page.waitForFunction(() => {
    return document.querySelectorAll('section h2').length > 1
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
