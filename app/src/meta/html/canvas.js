export default {
  displayName: 'canvas',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
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
      en: '<canvas> tag',
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
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
