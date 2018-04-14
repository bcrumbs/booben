export default {
  displayName: 'ins',
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
    dateTime: {
      textKey: 'props_dateTime',
      descriptionTextKey: 'props_dateTime_desc',
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
      en: '<ins> tag',
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
    props_dateTime: {
      en: 'datetime',
    },
    props_dateTime_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
