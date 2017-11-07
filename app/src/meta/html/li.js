/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'li',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'lists',
  props: {
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 0,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<li> tag',
    },
    description: {
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
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'ul' },
        { component: 'ol' },
      ],
    },
  },
};
