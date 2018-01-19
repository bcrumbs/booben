/* eslint-disable max-len */

export default {
  displayName: 'img',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  group: 'media',
  props: {
    alt: {
      textKey: 'props_alt',
      descriptionTextKey: 'props_alt_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    height: {
      textKey: 'props_height',
      descriptionTextKey: 'props_height_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    src: {
      textKey: 'props_src',
      descriptionTextKey: 'props_src_desc',
      required: true,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
    width: {
      textKey: 'props_width',
      descriptionTextKey: 'props_width_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
        data: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: 'Image',
    },
    description: {
      en: 'Represents an image in the document',
    },
    props_alt: {
      en: 'alt',
    },
    props_alt_desc: {
      en: 'This attribute defines the alternative text describing the image. Users will see this text displayed if the image URL is wrong, the image is not in one of the supported formats, or if the image is not yet downloaded.',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: 'The intrinsic height of the image in pixels.',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: 'The image URL.',
    },
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: 'The intrinsic width of the image in pixels.',
    },
  },
  tags: new Set(),

  placement: {
    root: 'deny',
  },
};
