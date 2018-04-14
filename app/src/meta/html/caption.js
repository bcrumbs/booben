export default {
  displayName: 'caption',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<caption> tag',
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
