export default {
  displayName: 'form',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    acceptCharset: {
      textKey: 'props_acceptCharset',
      descriptionTextKey: 'props_acceptCharset_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    action: {
      textKey: 'props_action',
      descriptionTextKey: 'props_action_desc',
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
    encType: {
      textKey: 'props_encType',
      descriptionTextKey: 'props_encType_desc',
      required: false,
      type: 'oneOf',
      options: [
        {
          value: 'application/x-www-form-urlencoded',
          textKey: 'props_encType_urlencoded',
        },
        {
          value: 'multipart/form-data',
          textKey: 'props_encType_formData',
        },
        {
          value: 'text/plain',
          textKey: 'props_encType_text',
        },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'application/x-www-form-urlencoded',
        },
      },
    },
    method: {
      textKey: 'props_method',
      descriptionTextKey: 'props_method_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'get', textKey: 'props_method_get' },
        { value: 'post', textKey: 'props_method_post' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'get',
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
    noValidate: {
      textKey: 'props_noValidate',
      descriptionTextKey: 'props_noValidate_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    target: {
      textKey: 'props_target',
      descriptionTextKey: 'props_target_desc',
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
      en: '<form> tag',
    },
    description: {
      en: '',
    },
    props_acceptCharset: {
      en: 'accept-charset',
    },
    props_acceptCharset_desc: {
      en: '',
    },
    props_action: {
      en: 'action',
    },
    props_action_desc: {
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
    props_encType: {
      en: 'enctype',
    },
    props_encType_desc: {
      en: '',
    },
    props_encType_urlencoded: {
      en: 'application/x-www-form-urlencoded',
    },
    props_encType_formData: {
      en: 'multipart/form-data',
    },
    props_encType_text: {
      en: 'text/plain',
    },
    props_method: {
      en: 'method',
    },
    props_method_desc: {
      en: '',
    },
    props_method_get: {
      en: 'get',
    },
    props_method_post: {
      en: 'post',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_noValidate: {
      en: 'novalidate',
    },
    props_noValidate_desc: {
      en: '',
    },
    props_target: {
      en: 'target',
    },
    props_target_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
