const template = {
  profile: {
    selector: '.scaffold-layout__main',
    fields: {
      name: '.text-heading-xlarge',
      headline: '.text-body-medium',
      location: '.text-body-small.inline.t-black--light.break-words',
      connections: '.t-bold',
      imageurl: {
        selector: 'img.pv-top-card-profile-picture__image',
        attribute: 'src'
      }
    }
  },
  about: {
    selector: '#about ~ .display-flex .inline-show-more-text',
    fields: {
      text: 'span[aria-hidden="true"]'
    }
  },
  positions: {
    selector: '#experience ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      title: '.mr1.hoverable-link-text.t-bold > span',
      link: {
        selector: 'a.optional-action-target-wrapper',
        attribute: 'href'
      },
      url: {
        selector: 'a.optional-action-target-wrapper',
        attribute: 'href'
      },
      companyName: '.t-14.t-normal > span',
      location: '.t-14.t-normal.t-black--light > span',
      description: '.pvs-list__outer-container .inline-show-more-text span[aria-hidden="true"]',
      date1: '.pvs-entity__caption-wrapper',
      date2: '.pvs-entity__caption-wrapper',
      roles: {
        selector: '.pvs-entity__sub-components li.pvs-list__paged-list-item',
        hasChildrenFields: true,
        fields: {
          title: '.mr1.hoverable-link-text.t-bold > span',
          description: '.inline-show-more-text span[aria-hidden="true"]',
          date: '.pvs-entity__caption-wrapper',
          location: '.t-14.t-normal.t-black--light > span'
        }
      }
    }
  },
  educations: {
    selector: '#education ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      title: '.hoverable-link-text.t-bold > span',
      degree: '.t-14.t-normal > span',
      url: {
        selector: 'a',
        attribute: 'href'
      },
      fieldOfStudy: '.t-14.t-normal > span',
      date1: '.pvs-entity__caption-wrapper',
      date2: '.pvs-entity__caption-wrapper',
      description: '.inline-show-more-text span[aria-hidden="true"]'
    }
  },
  skills: {
    selector: '#skills ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      title: '.mr1.hoverable-link-text.t-bold > span',
      count: '.t-14.t-normal.t-black--light > span'
    }
  },
  recommendationsCount: {
    selector: '#recommendations ~ .pvs-list__outer-container',
    fields: {
      received: '.artdeco-tab:nth-child(1)',
      given: '.artdeco-tab:nth-child(2)'
    }
  },
  recommendationsReceived: {
    selector: '#recommendations ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      user: {
        selector: 'a',
        attribute: 'href'
      },
      text: '.inline-show-more-text span[aria-hidden="true"]',
      profileImage: {
        selector: 'img',
        attribute: 'src'
      },
      name: {
        selector: '.t-bold > span'
      },
      userDescription: {
        selector: '.t-14.t-normal > span'
      }
    }
  },
  recommendationsGiven: {
    selector: '#recommendations ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      user: {
        selector: 'a',
        attribute: 'href'
      },
      text: '.inline-show-more-text span[aria-hidden="true"]',
      profileImage: {
        selector: 'img',
        attribute: 'src'
      },
      name: {
        selector: '.t-bold > span'
      },
      userDescription: {
        selector: '.t-14.t-normal > span'
      }
    }
  },
  accomplishments: {
    selector: '#honors_and_awards ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      count: '.t-14.t-normal.t-black--light > span',
      title: '.mr1.hoverable-link-text.t-bold > span',
      items: {
        selector: '.pvs-list__outer-container li',
        isMultipleFields: true
      }
    }
  },
  peopleAlsoViewed: {
    selector: '.pv-browsemap-section li',
    fields: {
      user: {
        selector: 'a',
        attribute: 'href'
      },
      text: '.t-14.t-normal',
      profileImage: {
        selector: 'img',
        attribute: 'src'
      },
      name: {
        selector: '.t-bold'
      }
    }
  },
  volunteerExperience: {
    selector: '#volunteering_experience ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      title: '.mr1.hoverable-link-text.t-bold > span',
      experience: '.t-14.t-normal > span',
      location: '.t-14.t-normal.t-black--light > span',
      description: '.inline-show-more-text span[aria-hidden="true"]',
      date1: '.pvs-entity__caption-wrapper',
      date2: '.pvs-entity__caption-wrapper'
    }
  },
  courses: {
    selector: '#courses ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      name: '.mr1.hoverable-link-text.t-bold > span',
      year: '.t-14.t-normal > span'
    }
  },
  languages: {
    selector: '#languages ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      name: '.mr1.t-bold > span',
      proficiency: '.t-14.t-normal.t-black--light > span'
    }
  },
  projects: {
    selector: '#projects ~ .pvs-list__outer-container .pvs-list > li.pvs-list__paged-list-item',
    fields: {
      name: '.mr1.hoverable-link-text.t-bold > span',
      date: '.pvs-entity__caption-wrapper',
      description: '.inline-show-more-text span[aria-hidden="true"]',
      link: {
        selector: 'a',
        attribute: 'href'
      }
    }
  }
}

module.exports = template
