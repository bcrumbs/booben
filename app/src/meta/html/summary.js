/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'summary',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'text',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<summary> tag',
    },
    description: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    inside: {
      include: [
        { component: 'details' },
      ],
    },
  },
};
