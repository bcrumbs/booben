export default {
  accessKey: {
    textKey: 'props_accessKey',
    descriptionTextKey: 'props_accessKey_desc',
    required: false,
    type: 'string',
    source: ['static'],
    sourceConfigs: {
      static: {
        default: '',
        defaultEnabled: false,
      },
    },
  },
  className: {
    textKey: 'props_className',
    descriptionTextKey: 'props_className_desc',
    required: false,
    type: 'string',
    source: ['static'],
    sourceConfigs: {
      static: {
        default: '',
        defaultEnabled: false,
      },
    },
  },
  dir: {
    textKey: 'props_dir',
    descriptionTextKey: 'props_dir_desc',
    required: false,
    type: 'oneOf',
    options: [
      { value: 'ltr', textKey: 'props_dir_ltr' },
      { value: 'rtl', textKey: 'props_dir_rtl' },
      { value: 'auto', textKey: 'props_dir_auto' },
    ],
    source: ['static'],
    sourceConfigs: {
      static: {
        default: 'ltr',
        defaultEnabled: false,
      },
    },
  },
  hidden: {
    textKey: 'props_hidden',
    descriptionTextKey: 'props_hidden_desc',
    required: false,
    type: 'bool',
    source: ['static'],
    sourceConfigs: {
      static: {
        default: false,
        defaultEnabled: false,
      },
    },
  },
  id: {
    textKey: 'props_id',
    descriptionTextKey: 'props_id_desc',
    required: false,
    type: 'string',
    source: ['static', 'data'],
    sourceConfigs: {
      static: {
        default: '',
        defaultEnabled: false,
      },
      data: {},
    },
  },
  lang: {
    textKey: 'props_lang',
    descriptionTextKey: 'props_lang_desc',
    required: false,
    type: 'string',
    source: ['static', 'data'],
    sourceConfigs: {
      static: {
        default: '',
        defaultEnabled: false,
      },
      data: {},
    },
  },
  spellCheck: {
    textKey: 'props_spellCheck',
    descriptionTextKey: 'props_spellCheck_desc',
    required: false,
    type: 'oneOf',
    options: [
      { value: 'true', textKey: 'props_spellCheck_true' },
      { value: 'false', textKey: 'props_spellCheck_false' },
    ],
    source: ['static'],
    sourceConfigs: {
      static: {
        default: 'true',
        defaultEnabled: false,
      },
    },
  },
  tabIndex: {
    textKey: 'props_tabIndex',
    descriptionTextKey: 'props_tabIndex_desc',
    required: false,
    type: 'int',
    source: ['static'],
    sourceConfigs: {
      static: {
        default: -1,
        defaultEnabled: false,
      },
    },
  },
  title: {
    textKey: 'props_title',
    descriptionTextKey: 'props_title_desc',
    required: false,
    type: 'string',
    source: ['static', 'data'],
    sourceConfigs: {
      static: {
        default: '',
        defaultEnabled: false,
      },
      data: {},
    },
  },
  onClick: {
    textKey: 'props_onClick',
    descriptionTextKey: 'props_onClick_desc',
    type: 'func',
    source: ['actions'],
    sourceConfigs: {
      actions: {
        args: [],
      },
    },
  },
};
