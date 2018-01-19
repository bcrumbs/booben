export default {
  displayName: 'embed',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
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
    type: {
      textKey: 'props_type',
      descriptionTextKey: 'props_type_desc',
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
      en: '<embed> tag',
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
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
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
