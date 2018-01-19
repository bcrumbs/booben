export default {
  displayName: 'source',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
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
    srcSet: {
      textKey: 'props_srcSet',
      descriptionTextKey: 'props_srcSet_desc',
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
    media: {
      textKey: 'props_media',
      descriptionTextKey: 'props_media_desc',
      required: true,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    sizes: {
      textKey: 'props_sizes',
      descriptionTextKey: 'props_sizes_desc',
      required: true,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    type: {
      textKey: 'props_type',
      descriptionTextKey: 'props_type_desc',
      required: true,
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
      en: '<source> tag',
    },
    description: {
      en: '',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_srcSet: {
      en: 'srcset',
    },
    props_srcSet_desc: {
      en: '',
    },
    props_media: {
      en: 'media',
    },
    props_media_desc: {
      en: '',
    },
    props_sizes: {
      en: 'sizes',
    },
    props_sizes_desc: {
      en: '',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'audio' },
        { component: 'picture' },
        { component: 'video' },
      ],
    },
  },
};
