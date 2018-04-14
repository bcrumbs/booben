export default {
  displayName: 'q',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    cite: {
      textKey: 'props_cite',
      descriptionTextKey: 'props_cite_desc',
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
      en: '<q> tag',
    },
    description: {
      en: '',
    },
    props_cite: {
      en: 'cite',
    },
    props_cite_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
