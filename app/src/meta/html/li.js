export default {
  displayName: 'li',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'basic',
  props: {
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: null,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: 'List item',
    },
    description: {
      en: 'Is used to represent an item in a list.',
    },
    props_value: {
      en: 'value',
    },
    props_value_desc: {
      en: 'This integer attribute indicates the current ordinal value of the' +
      ' list item as defined by the ordered list. The only allowed value for' +
      ' this attribute is a number, even if the list is displayed with Roman' +
      ' numerals or letters. List items that follow this one continue' +
      ' numbering from the value set. The value attribute has no meaning for' +
      ' unordered lists.',
    },
  },
  tags: new Set(),

  placement: {
    root: 'deny',
  },
};
