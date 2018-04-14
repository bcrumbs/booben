export default {
  displayName: 'col',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    span: {
      textKey: 'props_span',
      descriptionTextKey: 'props_span_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 1,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<col> tag',
    },
    description: {
      en: '',
    },
    props_span: {
      en: 'span',
    },
    props_span_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'colgroup' },
      ],
    },
  },
};
