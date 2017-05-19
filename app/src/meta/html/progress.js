/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'progress',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'forms',
  props: {
    max: {
      textKey: 'props_max',
      descriptionTextKey: 'props_max_desc',
      required: false,
      type: 'number',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 100,
        },
        data: {},
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: true,
      type: 'number',
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
      en: '<progress> tag',
    },
    description: {
      en: '',
    },
    props_max: {
      en: 'max',
    },
    props_max_desc: {
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
