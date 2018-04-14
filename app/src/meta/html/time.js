export default {
  displayName: 'time',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
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
      en: '<time> tag',
    },
    description: {
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
