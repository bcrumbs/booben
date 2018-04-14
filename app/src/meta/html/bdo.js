export default {
  displayName: 'bdo',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    dir: {
      textKey: 'props_dir',
      descriptionTextKey: 'props_dir_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'ltr', textKey: 'props_dir_ltr' },
        { value: 'rtl', textKey: 'props_dir_rtl' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'ltr',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<bdo> tag',
    },
    description: {
      en: '',
    },
    props_dir: {
      en: 'dir',
    },
    props_dir_desc: {
      en: '',
    },
    props_dir_ltr: {
      en: 'ltr',
    },
    props_dir_rtl: {
      en: 'rtl',
    },
  },
  tags: new Set(),
};
