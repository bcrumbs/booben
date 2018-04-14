export default {
  displayName: 'option',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    disabled: {
      textKey: 'props_disabled',
      descriptionTextKey: 'props_disabled_desc',
      required: false,
      type: 'bool',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
      },
    },
    label: {
      textKey: 'props_label',
      descriptionTextKey: 'props_label_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    selected: {
      textKey: 'props_selected',
      descriptionTextKey: 'props_selected_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
      },
    },
    value: {
      textKey: 'props_value',
      descriptionTextKey: 'props_value_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<option> tag',
    },
    description: {
      en: '',
    },
    props_disabled: {
      en: 'disabled',
    },
    props_disabled_desc: {
      en: '',
    },
    props_label: {
      en: 'label',
    },
    props_label_desc: {
      en: '',
    },
    props_selected: {
      en: 'selected',
    },
    props_selected_desc: {
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
        { component: 'select' },
        { component: 'optgroup' },
      ],
    },
  },
};
