/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 * @type {ComponentMeta}
 */
export default {
  displayName: 'Text',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    text: {
      textKey: 'props_text',
      descriptionTextKey: 'props_text_desc',
      type: 'string',
      source: ['static', 'data', 'state', 'routeParams'],
      sourceConfigs: {
        static: {
          defaultTextKey: 'default',
        },
        data: {},
        state: {},
        routeParams: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: 'Text',
    },
    description: {
      en: '',
    },
    props_text: {
      en: 'Text',
    },
    props_text_desc: {
      en: '',
    },
    default: {
      en: 'Text',
    },
  },
  tags: new Set(),
};
