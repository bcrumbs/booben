export default {
  displayName: 'fieldset',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    disabled: {
      textKey: 'props_disabled',
      descriptionTextKey: 'props_disabled_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
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
      en: '<fieldset> tag',
    },
    description: {
      en: '',
    },
    props_disabled: {
      en: 'disabled',
    },
    props_disabled_desc: {
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
