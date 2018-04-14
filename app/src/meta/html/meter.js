export default {
  displayName: 'meter',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
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
    high: {
      textKey: 'props_high',
      descriptionTextKey: 'props_high_desc',
      required: false,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
    low: {
      textKey: 'props_low',
      descriptionTextKey: 'props_low_desc',
      required: false,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
    max: {
      textKey: 'props_max',
      descriptionTextKey: 'props_max_desc',
      required: false,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
    min: {
      textKey: 'props_min',
      descriptionTextKey: 'props_min_desc',
      required: false,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
    optimum: {
      textKey: 'props_optimum',
      descriptionTextKey: 'props_optimum_desc',
      required: false,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: true,
      type: 'float',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 0,
        },
        data: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<meter> tag',
    },
    description: {
      en: '',
    },
    props_form: {
      en: 'form',
    },
    props_form_desc: {
      en: '',
    },
    props_high: {
      en: 'high',
    },
    props_high_desc: {
      en: '',
    },
    props_low: {
      en: 'low',
    },
    props_low_desc: {
      en: '',
    },
    props_max: {
      en: 'max',
    },
    props_max_desc: {
      en: '',
    },
    props_min: {
      en: 'min',
    },
    props_min_desc: {
      en: '',
    },
    props_optimum: {
      en: 'optimum',
    },
    props_optimum_desc: {
      en: '',
    },
    props_value: {
      en: 'value',
    },
    props_value_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
