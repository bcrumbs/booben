/**
 * @author Dmitriy Bizyaev
 */

export default {
  displayName: 'audio',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
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
  },
  propGroups: [],
  strings: {
    name: {
      en: '<audio> tag',
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
    props_loop: {
      en: 'loop',
    },
    props_loop_desc: {
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
  },
  tags: new Set(),
};
