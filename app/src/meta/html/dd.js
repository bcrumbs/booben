/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'dd',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'lists',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<dd> tag',
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
