/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'iframe',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  group: 'special',
  props: {
    height: {
      textKey: 'props_height',
      descriptionTextKey: 'props_height_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 150,
        },
      },
    },
    name: {
      textKey: 'props_name',
      descriptionTextKey: 'props_name_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    sandbox: {
      textKey: 'props_sandbox',
      descriptionTextKey: 'props_sandbox_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    src: {
      textKey: 'props_src',
      descriptionTextKey: 'props_src_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    srcDoc: {
      textKey: 'props_srcDoc',
      descriptionTextKey: 'props_srcDoc_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    width: {
      textKey: 'props_width',
      descriptionTextKey: 'props_width_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 300,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<iframe> tag',
    },
    description: {
      en: '',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_sandbox: {
      en: 'sandbox',
    },
    props_sandbox_desc: {
      en: '',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_srcDoc: {
      en: 'srcdoc',
    },
    props_srcDoc_desc: {
      en: '',
    },
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
