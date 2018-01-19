export default {
  displayName: 'rt',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
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
