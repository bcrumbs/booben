export default {
  displayName: 'track',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  hidden: true,
  props: {
    default: {
      textKey: 'props_default',
      descriptionTextKey: 'props_default_desc',
      required: false,
      type: 'bool',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
      },
    },
    kind: {
      textKey: 'props_kind',
      descriptionTextKey: 'props_kind_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'captions', textKey: 'props_kind_captions' },
        { value: 'chapters', textKey: 'props_kind_chapters' },
        { value: 'descriptions', textKey: 'props_kind_descriptions' },
        { value: 'metadata', textKey: 'props_kind_metadata' },
        { value: 'subtitles', textKey: 'props_kind_subtitles' },
      ],
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 'captions',
        },
        data: {},
      },
    },
    label: {
      textKey: 'props_label',
      descriptionTextKey: 'props_label_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
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
          default: false,
        },
        data: {},
      },
    },
    srcLang: {
      textKey: 'props_srcLang',
      descriptionTextKey: 'props_srcLang_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: false,
        },
        data: {},
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: '<track> tag',
    },
    description: {
      en: '',
    },
    props_default: {
      en: 'default',
    },
    props_default_desc: {
      en: '',
    },
    props_kind: {
      en: 'kind',
    },
    props_kind_desc: {
      en: '',
    },
    props_kind_captions: {
      en: 'captions',
    },
    props_kind_chapters: {
      en: 'chapters',
    },
    props_kind_descriptions: {
      en: 'descriptions',
    },
    props_kind_metadata: {
      en: 'metadata',
    },
    props_kind_subtitles: {
      en: 'subtitles',
    },
    props_label: {
      en: 'label',
    },
    props_label_desc: {
      en: '',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: '',
    },
    props_srcLang: {
      en: 'srclang',
    },
    props_srcLang_desc: {
      en: '',
    },
  },
  tags: new Set(),
  placement: {
    root: 'deny',
    inside: {
      include: [
        { component: 'audio' },
        { component: 'video' },
      ],
    },
  },
};
