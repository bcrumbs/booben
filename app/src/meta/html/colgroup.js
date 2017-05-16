/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'colgroup',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {
    span: {
      textKey: 'props_span',
      descriptionTextKey: 'props_span_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 1,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<colgroup> tag',
    },
    description: {
      en: '',
    },
    props_span: {
      en: 'span',
    },
    props_span_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
