/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'rt',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'text',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<rt> tag',
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
        { component: 'ruby' },
      ],
    },
  },
};
