/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'ol',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'lists',
  props: {
    reversed: {
      textKey: 'props_reversed',
      descriptionTextKey: 'props_reversed_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    start: {
      textKey: 'props_start',
      descriptionTextKey: 'props_start_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 1,
        },
      },
    },
    type: {
      textKey: 'props_type',
      descriptionTextKey: 'props_type_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: '1', textKey: 'props_type_1' },
        { value: 'A', textKey: 'props_type_A' },
        { value: 'a', textKey: 'props_type_a' },
        { value: 'I', textKey: 'props_type_I' },
        { value: 'i', textKey: 'props_type_i' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '1',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<ol> tag',
    },
    description: {
      en: '',
    },
    props_reversed: {
      en: 'reversed',
    },
    props_reversed_desc: {
      en: '',
    },
    props_start: {
      en: 'start',
    },
    props_start_desc: {
      en: '',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: '',
    },
    props_type_1: {
      en: '1',
    },
    props_type_A: {
      en: 'A',
    },
    props_type_a: {
      en: 'a',
    },
    props_type_I: {
      en: 'I',
    },
    props_type_i: {
      en: 'i',
    },
  },
  tags: new Set(),
};
