export default {
  displayName: 'rp',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<rp> tag',
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
        { component: 'rt' },
      ],
    },
  },
};
