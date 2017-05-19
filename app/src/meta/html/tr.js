/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'tr',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'table',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<tr> tag',
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
        { component: 'table' },
        { component: 'tbody' },
        { component: 'tfoot' },
        { component: 'thead' },
      ],
    },
  },
};
