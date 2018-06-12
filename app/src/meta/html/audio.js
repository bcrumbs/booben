export default {
  displayName: 'audio',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'media',
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
      en: 'Audio',
    },
    description: {
      en: 'Represents embedded audio content.',
    },
    props_autoPlay: {
      en: 'autoplay',
    },
    props_autoPlay_desc: {
      en: 'If specified (even if the value is "false"!), the audio will' +
      ' automatically begin playback as soon as it can do so, without waiting for the entire audio file to finish downloading.',
    },
    props_controls: {
      en: 'controls',
    },
    props_controls_desc: {
      en: 'If this attribute is present, the browser will offer controls to allow the user to control audio playback, including volume, seeking, and pause/resume playback.',
    },
    props_loop: {
      en: 'loop',
    },
    props_loop_desc: {
      en: 'If specified, will automatically seek back to the start upon' +
      ' reaching the end of the audio.',
    },
    props_muted: {
      en: 'Muted',
    },
    props_muted_desc: {
      en: 'Indicates whether the audio will be initially silenced. Its' +
      ' default value is false.',
    },
    props_preload: {
      en: 'preload',
    },
    props_preload_desc: {
      en: 'Intended to provide a hint to the browser about what the author' +
      ' thinks will lead to the best user experience.',
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
      en: 'Src',
    },
    props_src_desc: {
      en: 'The URL of the audio to embed.',
    },
  },
  tags: new Set(),
};
