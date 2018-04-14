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
      en: 'Video',
    },
    description: {
      en: 'Represent embedded video content.',
    },
    props_autoPlay: {
      en: 'autoplay',
    },
    props_autoPlay_desc: {
      en: 'If specified, the video automatically begins to play back as soon' +
      ' as it can do so without stopping to finish loading the data.',
    },
    props_controls: {
      en: 'controls',
    },
    props_controls_desc: {
      en: 'If this attribute is present, the browser will offer controls to allow the user to control video playback, including volume, seeking, and pause/resume playback.',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: 'The height of the video\'s display area, in pixels.',
    },
    props_loop: {
      en: 'loop',
    },
    props_loop_desc: {
      en: 'A Boolean attribute; if specified, we will, upon reaching the end of the video, automatically seek back to the start.',
    },
    props_muted: {
      en: 'muted',
    },
    props_muted_desc: {
      en: 'A Boolean attribute which indicates the default setting of the audio contained in the video. If set, the audio will be initially silenced. Its default value is false, meaning that the audio will be played when the video is played.',
    },
    props_poster: {
      en: 'Poster',
    },
    props_poster_desc: {
      en: 'A URL indicating a poster frame to show until the user plays or' +
      ' seeks. If this attribute isn\'t specified, nothing is displayed until the first frame is available; then the first frame is shown as the poster frame.',
    },
    props_preload: {
      en: 'preload',
    },
    props_preload_desc: {
      en: 'This enumerated attribute is intended to provide a hint to the' +
      ' browser about what the author thinks will lead to the best user' +
      ' experience.',
    },
    props_preload_none: {
      en: 'None',
    },
    props_preload_metadata: {
      en: 'Metadata',
    },
    props_preload_auto: {
      en: 'Auto',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: 'The URL of the video to embed.',
    },
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: 'The width of the video\'s display area, in pixels.',
    },
  },
  tags: new Set(),
};
