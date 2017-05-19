/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'dt',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'lists',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<dt> tag',
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
        { component: 'dl' },
      ],
    },
  },
};
