export default {
  displayName: 'textarea',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
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
    cols: {
      textKey: 'props_cols',
      descriptionTextKey: 'props_cols_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 20,
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
    maxLength: {
      textKey: 'props_maxLength',
      descriptionTextKey: 'props_maxLength_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 0,
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
    placeholder: {
      textKey: 'props_placeholder',
      descriptionTextKey: 'props_placeholder_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    readOnly: {
      textKey: 'props_readOnly',
      descriptionTextKey: 'props_readOnly_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
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
    rows: {
      textKey: 'props_rows',
      descriptionTextKey: 'props_rows_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 2,
        },
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    defaultValue: {
      textKey: 'props_defaultValue',
      descriptionTextKey: 'props_defaultValue_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    wrap: {
      textKey: 'props_wrap',
      descriptionTextKey: 'props_wrap_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'soft', textKey: 'props_wrap_soft' },
        { value: 'hard', textKey: 'props_wrap_hard' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'soft',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<textarea> tag',
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
    props_cols: {
      en: 'cols',
    },
    props_cols_desc: {
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
    props_maxLength: {
      en: 'maxlength',
    },
    props_maxLength_desc: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_placeholder: {
      en: 'placeholder',
    },
    props_placeholder_desc: {
      en: '',
    },
    props_readOnly: {
      en: 'readonly',
    },
    props_readOnly_desc: {
      en: '',
    },
    props_required: {
      en: 'required',
    },
    props_required_desc: {
      en: '',
    },
    props_rows: {
      en: 'rows',
    },
    props_rows_desc: {
      en: '',
    },
    props_value: {
      en: 'value',
    },
    props_value_desc: {
      en: '',
    },
    props_defaultValue: {
      en: 'defaultValue',
    },
    props_defaultValue_desc: {
      en: '',
    },
    props_wrap: {
      en: 'wrap',
    },
    props_wrap_desc: {
      en: '',
    },
    props_wrap_soft: {
      en: 'soft',
    },
    props_wrap_hard: {
      en: 'hard',
    },
  },
  tags: new Set(),
};
