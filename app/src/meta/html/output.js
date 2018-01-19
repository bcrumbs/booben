export default {
  displayName: 'output',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    htmlFor: {
      textKey: 'props_htmlFor',
      descriptionTextKey: 'props_htmlFor_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    form: {
      textKey: 'props_form',
      descriptionTextKey: 'props_form_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
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
  },
  propGroups: [],
  strings: {
    name: {
      en: '<output> tag',
    },
    description: {
      en: '',
    },
    props_htmlFor: {
      en: 'for',
    },
    props_htmlFor_desc: {
      en: '',
    },
    props_form: {
      en: 'form',
    },
    props_form_desc: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
