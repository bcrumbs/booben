export default {
  displayName: 'param',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    name: {
      textKey: 'props_name',
      descriptionTextKey: 'props_name_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<param> tag',
    },
    description: {
      en: '',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: '',
    },
    props_value: {
      en: 'value',
    },
    props_value_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'object' },
      ],
    },
  },
};
