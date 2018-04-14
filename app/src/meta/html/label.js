export default {
  displayName: 'label',
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
  },
  propGroups: [],
  strings: {
    name: {
      en: '<label> tag',
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
  },
  tags: new Set(),
};
