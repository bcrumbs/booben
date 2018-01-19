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
      en: 'Table body',
    },
    description: {
      en: 'Groups one or more Table Rows as the body of a Table.',
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
