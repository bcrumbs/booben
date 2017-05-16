/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export default {
  displayName: 'figcaption',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'media',
  props: {},
  propGroups: [],
  strings: {
    name: {
      en: '<figcaption> tag',
    },
    description: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    inside: {
      include: [
        { component: 'figure' },
      ],
    },
  },
};
