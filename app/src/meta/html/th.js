export default {
  displayName: 'th',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    abbr: {
      textKey: 'props_abbr',
      descriptionTextKey: 'props_abbr_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    colSpan: {
      textKey: 'props_colSpan',
      descriptionTextKey: 'props_colSpan_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 1,
        },
      },
    },
    headers: {
      textKey: 'props_headers',
      descriptionTextKey: 'props_headers_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    rowSpan: {
      textKey: 'props_rowSpan',
      descriptionTextKey: 'props_rowSpan_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 1,
        },
      },
    },
    scope: {
      textKey: 'props_scope',
      descriptionTextKey: 'props_scope_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'col', textKey: 'props_scope_col' },
        { value: 'colgroup', textKey: 'props_scope_colgroup' },
        { value: 'row', textKey: 'props_scope_row' },
        { value: 'rowgroup', textKey: 'props_scope_rowgroup' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'col',
        },
      },
    },
    sorted: {
      textKey: 'props_sorted',
      descriptionTextKey: 'props_sorted_desc',
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
      en: '<th> tag',
    },
    description: {
      en: '',
    },
    props_abbr: {
      en: 'abbr',
    },
    props_abbr_desc: {
      en: '',
    },
    props_colSpan: {
      en: 'colspan',
    },
    props_colSpan_desc: {
      en: '',
    },
    props_headers: {
      en: 'headers',
    },
    props_headers_desc: {
      en: '',
    },
    props_rowSpan: {
      en: 'rowspan',
    },
    props_rowSpan_desc: {
      en: '',
    },
    props_scope: {
      en: 'scope',
    },
    props_scope_desc: {
      en: '',
    },
    props_scope_col: {
      en: 'col',
    },
    props_scope_colgroup: {
      en: 'colgroup',
    },
    props_scope_row: {
      en: 'row',
    },
    props_scope_rowgroup: {
      en: 'rowgroup',
    },
    props_sorted: {
      en: 'sorted',
    },
    props_sorted_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'tr' },
      ],
    },
  },
};
