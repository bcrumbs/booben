/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'tbody',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<tbody> tag',
    },
    description: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'table' },
      ],
    },
  },
};
