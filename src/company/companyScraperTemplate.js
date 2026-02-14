const template = {
  profile: {
    selector: '.org-top-card, .top-card-layout',
    fields: {
      name: 'h1',
      headline: '.org-top-card-summary__tagline, .top-card-layout__headline, p',
      imageurl: {
        selector: 'img.org-top-card-primary-content__logo, img.top-card-layout__entity-image',
        attribute: 'src'
      }
    }
  },
  about: {
    selector: '.org-grid__core-rail--no-margin-left, .org-about-us-organization-description, .core-section-container',
    fields: {
      overview: 'p',
      types: {
        selector: 'dl dt, .org-page-details__definition-term',
        isMultipleFields: true
      },
      values: {
        selector: 'dl dd:not(.org-page-details__employees-on-linkedin-count), .org-page-details__definition-text',
        isMultipleFields: true
      }
    }
  }
}

module.exports = template
