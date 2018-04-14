export default {
  displayName: 'blockquote',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'text',
  props: {
    cite: {
      textKey: 'props_cite',
      descriptionTextKey: 'props_cite_desc',
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
      en: 'Block Quote',
    },
    description: {
      en: 'Display and style a quotation.',
    },
    props_cite: {
      en: 'cite',
    },
    props_cite_desc: {
      en: 'Specifies the source of the quotation.',
    },
  },
  tags: new Set(),
};
