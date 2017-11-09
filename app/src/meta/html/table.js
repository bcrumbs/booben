/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'table',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {
    sortable: {
      textKey: 'props_sortable',
      descriptionTextKey: 'props_sortable_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<table> tag',
    },
    description: {
      en: '',
    },
    props_sortable: {
      en: 'sortable',
    },
    props_sortable_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
