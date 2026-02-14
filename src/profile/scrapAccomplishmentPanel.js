const scrapSection = require('../scrapSection')
const template = require('./profileScraperTemplate')

const scrapAccomplishmentPanel = async (page, section) => {
  if (!template[section]) {
    return []
  }
  return scrapSection(page, template[section])
}

module.exports = scrapAccomplishmentPanel
