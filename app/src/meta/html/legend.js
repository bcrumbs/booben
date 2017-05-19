/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'legend',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'forms',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<legend> tag',
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
        { component: 'fieldset' },
      ],
    },
  },
};
