/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'video',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'media',
  props: {
    autoPlay: {
      textKey: 'props_autoPlay',
      descriptionTextKey: 'props_autoPlay_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    controls: {
      textKey: 'props_controls',
      descriptionTextKey: 'props_controls_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    height: {
      textKey: 'props_height',
      descriptionTextKey: 'props_height_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 240,
        },
      },
    },
    loop: {
      textKey: 'props_loop',
      descriptionTextKey: 'props_loop_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    muted: {
      textKey: 'props_muted',
      descriptionTextKey: 'props_muted_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
      },
    },
    poster: {
      textKey: 'props_poster',
      descriptionTextKey: 'props_poster_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    preload: {
      textKey: 'props_preload',
      descriptionTextKey: 'props_preload_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'none', textKey: 'props_preload_none' },
        { value: 'metadata', textKey: 'props_preload_metadata' },
        { value: 'auto', textKey: 'props_preload_auto' },
      ],
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 'none',
        },
      },
    },
    src: {
      textKey: 'props_src',
      descriptionTextKey: 'props_src_desc',
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
    width: {
      textKey: 'props_width',
      descriptionTextKey: 'props_width_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 320,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<video> tag',
    },
    description: {
      en: '',
    },
    props_autoPlay: {
      en: 'autoplay',
    },
    props_autoPlay_desc: {
      en: '',
    },
    props_controls: {
      en: 'controls',
    },
    props_controls_desc: {
      en: '',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: '',
    },
    props_loop: {
      en: 'loop',
    },
    props_loop_desc: {
      en: '',
    },
    props_muted: {
      en: 'muted',
    },
    props_muted_desc: {
      en: '',
    },
    props_poster: {
      en: 'poster',
    },
    props_poster_desc: {
      en: '',
    },
    props_preload: {
      en: 'preload',
    },
    props_preload_desc: {
      en: '',
    },
    props_preload_none: {
      en: 'none',
    },
    props_preload_metadata: {
      en: 'metadata',
    },
    props_preload_auto: {
      en: 'auto',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: '',
    },
  },
  tags: new Set(),
};
