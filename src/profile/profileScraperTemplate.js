const profileSelector = '.core-rail > *:first-child section >'

const template = {
  profile: {
    selector: '.pv-top-card',
    fields: {
      name: `.pv-text-details__left-panel:first-child h1`,
      headline: `.pv-text-details__left-panel:first-child .text-body-medium`,
      location: `.pv-text-details__left-panel:first-child .pb2 span`,
      connections: `.pv-top-card--list span`,
      imageurl: {
		    selector: `img.pv-top-card__photo`,
        attribute: 'src'
      }
    }
  },
  about: {
    selector: '.pv-about-section',
    fields: {
      text: 'div'
    }
  },
  positions: {
    selector: 'div[id="experience"] + div + div li.artdeco-list__item',
    fields: {
      title: 'h3',
      link: {
        selector: 'a',
        attribute: 'href',
      },
      url: {
        selector: 'a',
        attribute: 'href'
      },
      companyName: 'span.t-bold span',
      location: '.pv-entity__location span:last-child',
      description: '.pv-entity__description',
      date1: '.pv-entity__date-range span:last-child',
      date2: '.pv-entity__bullet-item-v2',
      roles: {
        selector: 'li',
        hasChildrenFields: true,
        fields: {
          title: 'span.t-bold span:last-child',
          description: '.pv-entity__description',
          date: '.t-14.t-normal:last-child span:first-child',
          location: '.pv-entity__location span:last-child'
        }
      }
    }
  },
  educations: {
    selector: '#education-section li',
    fields: {
      title: 'h3',
      degree: 'span[class=pv-entity__comma-item]',
      url: {
        selector: 'a',
        attribute: 'href'
      },
	    fieldOfStudy: 'p.pv-entity__fos span:nth-child(2)',
      date1: '.pv-entity__dates time:nth-child(1)',
      date2: '.pv-entity__dates time:nth-child(2)',
      description: '.pv-entity__description'
    }
  },
  skills: {
    selector: '.pv-skill-category-entity__skill-wrapper',
    fields: {
      title: '.pv-skill-category-entity__name-text',
      count: '.pv-skill-category-entity__endorsement-count'
    }
  },
  recommendationsCount: {
    selector: '.recommendations-inlining',
    fields: {
      received: '.artdeco-tab:nth-child(1)',
      given: '.artdeco-tab:nth-child(2)'
    }
  },
  recommendationsReceived: {
    selector: '.recommendations-inlining',
    fields: {
      user: {
        selector: '.pv-recommendation-entity__member',
        attribute: 'href'
      },
      text: 'blockquote.pv-recommendation-entity__text',
      profileImage: {
        selector: 'a img',
        attribute: 'src'
      },
      name: {
        selector: 'a h3'
      },
      userDescription: {
        selector: '.pv-recommendation-entity__headline'
      }
    }
  },
  recommendationsGiven: {
    selector: '.artdeco-tabpanel li.pv-recommendation-entity',
    fields: {
      user: {
        selector: '.pv-recommendation-entity__member',
        attribute: 'href'
      },
      text: 'blockquote.pv-recommendation-entity__text',
      profileImage: {
        selector: 'a img',
        attribute: 'src'
      },
      name: {
        selector: 'a h3'
      },
      userDescription: {
        selector: '.pv-recommendation-entity__headline'
      }
    }
  },
  accomplishments: {
    selector: '.pv-accomplishments-section > div',
    fields: {
      count: 'h3 span:last-child',
      title: '.pv-accomplishments-block__title',
      items: {
        selector: 'li',
        isMultipleFields: true
      }
    }
  },
  peopleAlsoViewed: {
    selector: 'li.pv-browsemap-section__member-container',
    fields: {
      user: {
        selector: 'a',
        attribute: 'href'
      },
      text: 'p',
      profileImage: {
        selector: 'a img',
        attribute: 'src'
      },
      name: {
        selector: '.name'
      }
    }
  },
  volunteerExperience: {
    selector: 'section.volunteering-section li',
    fields: {
      title: 'h3',
      experience: 'span[class=pv-entity__secondary-title]',
      location: '.pv-entity__location span:nth-child(2)',
      description: '.pv-volunteer-causes',
      date1: '.pv-entity__date-range span:nth-child(2)',
      date2: '.pv-entity__bullet-item'
    }
  },
  courses: {
    selector: '.pv-accomplishments-section',
    fields: {
      name: '.pv-accomplishment-entity__title',
      year: '.pv-accomplishment-entity__course-number'
    }
  },
  languages: {
    selector: '.pv-accomplishments-block.languages li',
    fields: {
      name: '.pv-accomplishment-entity__title',
      proficiency: '.pv-accomplishment-entity__proficiency',
    }
  },
  projects: {
    selector: '.pv-accomplishments-block.projects li',
    fields: {
      name: '.pv-accomplishment-entity__title',
      date: '.pv-accomplishment-entity__date',
      description: '.pv-accomplishment-entity__description',
      link: {
        selector: '.mt4',
        attribute: 'href'
      }
    }
  }
}


module.exports = template
