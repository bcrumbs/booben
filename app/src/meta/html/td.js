/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
      type: 'number',
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
  },
  propGroups: [],
  strings: {
    name: {
      en: '<td> tag',
    },
    description: {
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
