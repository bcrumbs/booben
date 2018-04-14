export default {
  displayName: 'tr',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: 'Table row',
    },
    description: {
      en: 'A row of cells in a table',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'table' },
        { component: 'tbody' },
        { component: 'tfoot' },
        { component: 'thead' },
      ],
    },
  },
};
