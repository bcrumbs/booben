export default {
  displayName: 'area',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  hidden: true,
  props: {
    accessKey: {
      textKey: 'props_accessKey',
      descriptionTextKey: 'props_accessKey_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
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
    coords: {
      textKey: 'props_coords',
      descriptionTextKey: 'props_coords_desc',
      required: false,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    href: {
      textKey: 'props_href',
      descriptionTextKey: 'props_href_desc',
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
    hrefLang: {
      textKey: 'props_hrefLang',
      descriptionTextKey: 'props_hrefLang_desc',
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
    shape: {
      textKey: 'props_shape',
      descriptionTextKey: 'props_shape_desc',
      required: false,
      type: 'oneOf',
      options: [
        { value: 'circle', textKey: 'props_shape_circle' },
        { value: 'default', textKey: 'props_shape_default' },
        { value: 'poly', textKey: 'props_shape_poly' },
        { value: 'rect', textKey: 'props_shape_rect' },
      ],
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 'rect',
        },
        data: {},
      },
    },
    target: {
      textKey: 'props_target',
      descriptionTextKey: 'props_target_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '_self',
        },
      },
    },
    type: {
      textKey: 'props_type',
      descriptionTextKey: 'props_type_desc',
      required: false,
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
      en: '<area> tag',
    },
    description: {
      en: '',
    },
    props_accessKey: {
      en: 'accesskey',
    },
    props_accessKey_desc: {
      en: '',
    },
    props_alt: {
      en: 'alt',
    },
    props_alt_desc: {
      en: '',
    },
    props_coords: {
      en: 'coords',
    },
    props_coords_desc: {
      en: '',
    },
    props_href: {
      en: 'href',
    },
    props_href_desc: {
      en: '',
    },
    props_hrefLang: {
      en: 'hreflang',
    },
    props_hrefLang_desc: {
      en: '',
    },
    props_shape: {
      en: 'shape',
    },
    props_shape_desc: {
      en: '',
    },
    props_shape_circle: {
      en: 'circle',
    },
    props_shape_default: {
      en: 'default',
    },
    props_shape_poly: {
      en: 'poly',
    },
    props_shape_rect: {
      en: 'rect',
    },
    props_target: {
      en: 'target',
    },
    props_target_desc: {
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
        { component: 'map' },
      ],
    },
  },
};
