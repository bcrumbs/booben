export default {
  displayName: 'details',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    open: {
      textKey: 'props_open',
      descriptionTextKey: 'props_open_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<details> tag',
    },
    description: {
      en: '',
    },
    props_open: {
      en: 'open',
    },
    props_open_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
