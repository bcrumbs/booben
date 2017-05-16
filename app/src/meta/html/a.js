/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'a',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'text',
  props: {
    accessKey: {
      textKey: 'props_accessKey',
      descriptionTextKey: 'props_accessKey_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    download: {
      textKey: 'props_download',
      descriptionTextKey: 'props_download_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    href: {
      textKey: 'props_href',
      descriptionTextKey: 'props_href_desc',
      required: true,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    hrefLang: {
      textKey: 'props_hrefLang',
      descriptionTextKey: 'props_hrefLang_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    rel: {
      textKey: 'props_rel',
      descriptionTextKey: 'props_rel_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    target: {
      textKey: 'props_target',
      descriptionTextKey: 'props_target_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '_self',
        },
      },
    },
    type: {
      textKey: 'props_type',
      descriptionTextKey: 'props_type_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<a> tag',
    },
    description: {
      en: '',
    },
    props_accessKey: {
      en: 'accesskey',
    },
    props_accessKey_desc: {
      en: '',
    },
    props_download: {
      en: 'download',
    },
    props_download_desc: {
      en: '',
    },
    props_href: {
      en: 'href',
    },
    props_href_desc: {
      en: '',
    },
    props_hrefLang: {
      en: 'hreflang',
    },
    props_hrefLang_desc: {
      en: '',
    },
    props_rel: {
      en: 'rel',
    },
    props_rel_desc: {
      en: '',
    },
    props_target: {
      en: 'target',
    },
    props_target_desc: {
      en: '',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
