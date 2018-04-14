export default {
  displayName: 'button',
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
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
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
    formAction: {
      textKey: 'props_formAction',
      descriptionTextKey: 'props_formAction_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    formEncType: {
      textKey: 'props_formEncType',
      descriptionTextKey: 'props_formEncType_desc',
      required: false,
      type: 'oneOf',
      options: [
        {
          value: 'application/x-www-form-urlencoded',
          textKey: 'props_formEncType_urlencoded',
        },
        {
          value: 'multipart/form-data',
          textKey: 'props_formEncType_formData',
        },
        {
          value: 'text/plain',
          textKey: 'props_formEncType_text',
        },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'application/x-www-form-urlencoded',
        },
      },
    },
    formMethod: {
      textKey: 'props_formMethod',
      descriptionTextKey: 'props_formMethod_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'get', textKey: 'props_formMethod_get' },
        { value: 'post', textKey: 'props_formMethod_post' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'get',
        },
      },
    },
    formNoValidate: {
      textKey: 'props_formNoValidate',
      descriptionTextKey: 'props_formNoValidate_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    formTarget: {
      textKey: 'props_formTarget',
      descriptionTextKey: 'props_formTarget_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
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
      type: 'oneOf',
      options: [
        { value: 'button', textKey: 'props_type_button' },
        { value: 'reset', textKey: 'props_type_reset' },
        { value: 'submit', textKey: 'props_type_submit' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'button',
        },
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
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
      en: '<button> tag',
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
    props_formAction: {
      en: 'formaction',
    },
    props_formAction_desc: {
      en: '',
    },
    props_formEncType: {
      en: 'formenctype',
    },
    props_formEncType_desc: {
      en: '',
    },
    props_formEncType_urlencoded: {
      en: 'application/x-www-form-urlencoded',
    },
    props_formEncType_formData: {
      en: 'multipart/form-data',
    },
    props_formEncType_text: {
      en: 'text/plain',
    },
    props_formMethod: {
      en: 'formmethod',
    },
    props_formMethod_desc: {
      en: '',
    },
    props_formMethod_get: {
      en: 'get',
    },
    props_formMethod_post: {
      en: 'post',
    },
    props_formNoValidate: {
      en: 'formnovalidate',
    },
    props_formNoValidate_desc: {
      en: '',
    },
    props_formTarget: {
      en: 'formtarget',
    },
    props_formTarget_desc: {
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
    props_type_button: {
      en: 'button',
    },
    props_type_reset: {
      en: 'reset',
    },
    props_type_submit: {
      en: 'submit',
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
