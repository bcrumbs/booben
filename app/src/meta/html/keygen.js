export default {
  displayName: 'keygen',
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
    challenge: {
      textKey: 'props_challenge',
      descriptionTextKey: 'props_challenge_desc',
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
    keyType: {
      textKey: 'props_keyType',
      descriptionTextKey: 'props_keyType_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'rsa', textKey: 'props_keyType_rsa' },
        { value: 'dsa', textKey: 'props_keyType_dsa' },
        { value: 'ec', textKey: 'props_keyType_ec' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'rsa',
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
  },
  propGroups: [],
  strings: {
    name: {
      en: '<keygen> tag',
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
    props_challenge: {
      en: 'challenge',
    },
    props_challenge_desc: {
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
    props_keyType: {
      en: 'keyType',
    },
    props_keyType_desc: {
      en: '',
    },
    props_keyType_rsa: {
      en: 'rsa',
    },
    props_keyType_dsa: {
      en: 'dsa',
    },
    props_keyType_ec: {
      en: 'ec',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
