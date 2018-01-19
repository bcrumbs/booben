export default {
  displayName: 'td',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {
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
  },
  propGroups: [],
  strings: {
    name: {
      en: 'Table Cell',
    },
    description: {
      en: 'A cell of a table that contains data',
    },
    props_colSpan: {
      en: 'Column span',
    },
    props_colSpan_desc: {
      en: 'This attribute contains a non-negative integer value that indicates for how many columns the cell extends.',
    },
    props_rowSpan: {
      en: 'Row span',
    },
    props_rowSpan_desc: {
      en: 'This attribute contains a non-negative integer value that' +
      ' indicates for how many rows the cell extends. Its default value is' +
      ' 1; if its value is set to 0, it extends until the end of the table' +
      ' section (table head, table body, table foot, even if implicitly' +
      ' defined, that the cell belongs to.',
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
