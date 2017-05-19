/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
      },
      data: {},
    },
  },
};
