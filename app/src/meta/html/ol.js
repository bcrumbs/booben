export default {
  displayName: 'ol',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'basic',
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
      en: 'Ordered list',
    },
    description: {
      en: 'Represents an ordered list of items, typically rendered as a' +
      ' numbered list',
    },
    props_reversed: {
      en: 'reversed',
    },
    props_reversed_desc: {
      en: 'This Boolean attribute specifies that the items of the list are specified in reversed order.',
    },
    props_start: {
      en: 'start',
    },
    props_start_desc: {
      en: 'This integer attribute specifies the start value for numbering the individual list items. Although the ordering type of list elements might be Roman numerals, such as XXXI, or letters, the value of start is always represented as a number. To start numbering elements from the letter "C", use start="3".',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: 'Indicates the numbering type',
    },
    props_type_1: {
      en: '1 - numbers',
    },
    props_type_A: {
      en: 'A - uppercase letters',
    },
    props_type_a: {
      en: 'a - lowercase letters',
    },
    props_type_I: {
      en: 'I - uppercase Roman numerals',
    },
    props_type_i: {
      en: 'i - lowercase Roman numerals',
    },
  },
  tags: new Set(),
};
