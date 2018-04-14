export default {
  displayName: 'thead',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: 'Table header',
    },
    description: {
      en: 'A set of rows defining the head of the columns of the table.',
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
