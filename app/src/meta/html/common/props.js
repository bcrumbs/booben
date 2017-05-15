/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
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
};
