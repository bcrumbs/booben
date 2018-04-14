export default {
  displayName: 'input',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    accept: {
      textKey: 'props_accept',
      descriptionTextKey: 'props_accept_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    alt: {
      textKey: 'props_alt',
      descriptionTextKey: 'props_alt_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    autoComplete: {
      textKey: 'props_autoComplete',
      descriptionTextKey: 'props_autoComplete_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'on', textKey: 'props_autoComplete_on' },
        { value: 'off', textKey: 'props_autoComplete_off' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'on',
        },
      },
    },
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
    checked: {
      textKey: 'props_checked',
      descriptionTextKey: 'props_checked_desc',
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
    defaultChecked: {
      textKey: 'props_defaultChecked',
      descriptionTextKey: 'props_defaultChecked_desc',
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
    height: {
      textKey: 'props_height',
      descriptionTextKey: 'props_height_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 20,
        },
      },
    },
    list: {
      textKey: 'props_list',
      descriptionTextKey: 'props_list_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    max: {
      textKey: 'props_max',
      descriptionTextKey: 'props_max_desc',
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
    min: {
      textKey: 'props_min',
      descriptionTextKey: 'props_min_desc',
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
    pattern: {
      textKey: 'props_pattern',
      descriptionTextKey: 'props_pattern_desc',
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
    src: {
      textKey: 'props_src',
      descriptionTextKey: 'props_src_desc',
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
    step: {
      textKey: 'props_step',
      descriptionTextKey: 'props_step_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 0,
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
        { value: 'checkbox', textKey: 'props_type_checkbox' },
        { value: 'color', textKey: 'props_type_color' },
        { value: 'date', textKey: 'props_type_date' },
        { value: 'datetime-local', textKey: 'props_type_datetimeLocal' },
        { value: 'email', textKey: 'props_type_email' },
        { value: 'file', textKey: 'props_type_file' },
        { value: 'hidden', textKey: 'props_type_hidden' },
        { value: 'image', textKey: 'props_type_image' },
        { value: 'month', textKey: 'props_type_month' },
        { value: 'number', textKey: 'props_type_number' },
        { value: 'password', textKey: 'props_type_password' },
        { value: 'radio', textKey: 'props_type_radio' },
        { value: 'range', textKey: 'props_type_range' },
        { value: 'reset', textKey: 'props_type_reset' },
        { value: 'search', textKey: 'props_type_search' },
        { value: 'submit', textKey: 'props_type_submit' },
        { value: 'tel', textKey: 'props_type_tel' },
        { value: 'text', textKey: 'props_type_text' },
        { value: 'time', textKey: 'props_type_time' },
        { value: 'url', textKey: 'props_type_url' },
        { value: 'week', textKey: 'props_type_week' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'text',
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
    width: {
      textKey: 'props_width',
      descriptionTextKey: 'props_width_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 200,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<input> tag',
    },
    description: {
      en: '',
    },
    props_accept: {
      en: 'accept',
    },
    props_accept_desc: {
      en: '',
    },
    props_alt: {
      en: 'alt',
    },
    props_alt_desc: {
      en: '',
    },
    props_autoComplete: {
      en: 'autocomplete',
    },
    props_autoComplete_desc: {
      en: '',
    },
    props_autoComplete_on: {
      en: 'on',
    },
    props_autoComplete_off: {
      en: 'off',
    },
    props_autoFocus: {
      en: 'autofocus',
    },
    props_autoFocus_desc: {
      en: '',
    },
    props_checked: {
      en: 'checked',
    },
    props_checked_desc: {
      en: '',
    },
    props_defaultChecked: {
      en: 'defaultChecked',
    },
    props_defaultChecked_desc: {
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
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: '',
    },
    props_list: {
      en: 'list',
    },
    props_list_desc: {
      en: '',
    },
    props_max: {
      en: 'max',
    },
    props_max_desc: {
      en: '',
    },
    props_maxLength: {
      en: 'maxlength',
    },
    props_maxLength_desc: {
      en: '',
    },
    props_min: {
      en: 'min',
    },
    props_min_desc: {
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
    props_pattern: {
      en: 'pattern',
    },
    props_pattern_desc: {
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
    props_size: {
      en: 'size',
    },
    props_size_desc: {
      en: '',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_step: {
      en: 'step',
    },
    props_step_desc: {
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
    props_type_checkbox: {
      en: 'checkbox',
    },
    props_type_color: {
      en: 'color',
    },
    props_type_date: {
      en: 'date',
    },
    props_type_datetimeLocal: {
      en: 'datetime-local',
    },
    props_type_email: {
      en: 'email',
    },
    props_type_file: {
      en: 'file',
    },
    props_type_hidden: {
      en: 'hidden',
    },
    props_type_image: {
      en: 'image',
    },
    props_type_month: {
      en: 'month',
    },
    props_type_number: {
      en: 'number',
    },
    props_type_password: {
      en: 'password',
    },
    props_type_radio: {
      en: 'radio',
    },
    props_type_range: {
      en: 'range',
    },
    props_type_reset: {
      en: 'reset',
    },
    props_type_search: {
      en: 'search',
    },
    props_type_submit: {
      en: 'submit',
    },
    props_type_tel: {
      en: 'tel',
    },
    props_type_text: {
      en: 'text',
    },
    props_type_time: {
      en: 'time',
    },
    props_type_url: {
      en: 'url',
    },
    props_type_week: {
      en: 'week',
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
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
