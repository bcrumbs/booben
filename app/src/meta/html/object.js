export default {
  displayName: 'object',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    data: {
      textKey: 'props_data',
      descriptionTextKey: 'props_data_desc',
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
    useMap: {
      textKey: 'props_useMap',
      descriptionTextKey: 'props_useMap_desc',
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
      en: '<object> tag',
    },
    description: {
      en: '',
    },
    props_data: {
      en: 'data',
    },
    props_data_desc: {
      en: '',
    },
    props_form: {
      en: 'form',
    },
    props_form_desc: {
      en: '',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: '',
    },
    props_useMap: {
      en: 'usemap',
    },
    props_useMap_desc: {
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
