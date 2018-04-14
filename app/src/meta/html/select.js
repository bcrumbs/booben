export default {
  displayName: 'select',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    autoFocus: {
      textKey: 'props_autoFocus',
      descriptionTextKey: 'props_autoFocus_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    disabled: {
      textKey: 'props_disabled',
      descriptionTextKey: 'props_disabled_desc',
      required: false,
      type: 'bool',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
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
    multiple: {
      textKey: 'props_multiple',
      descriptionTextKey: 'props_multiple_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
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
    required: {
      textKey: 'props_required',
      descriptionTextKey: 'props_required_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    size: {
      textKey: 'props_size',
      descriptionTextKey: 'props_size_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 0,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<select> tag',
    },
    description: {
      en: '',
    },
    props_autoFocus: {
      en: 'autofocus',
    },
    props_autoFocus_desc: {
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
    props_multiple: {
      en: 'multiple',
    },
    props_multiple_desc: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_required: {
      en: 'required',
    },
    props_required_desc: {
      en: '',
    },
    props_size: {
      en: 'size',
    },
    props_size_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
