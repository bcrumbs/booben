export default {
  displayName: 'iframe',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'atomic',
  group: 'media',
  props: {
    height: {
      textKey: 'props_height',
      descriptionTextKey: 'props_height_desc',
      required: false,
      type: 'int',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: 150,
        },
      },
    },
    name: {
      textKey: 'props_name',
      descriptionTextKey: 'props_name_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    sandbox: {
      textKey: 'props_sandbox',
      descriptionTextKey: 'props_sandbox_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    src: {
      textKey: 'props_src',
      descriptionTextKey: 'props_src_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    srcDoc: {
      textKey: 'props_srcDoc',
      descriptionTextKey: 'props_srcDoc_desc',
      required: false,
      type: 'string',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: '',
        },
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
          default: 300,
        },
      },
    },
  },
  propGroups: [],
  strings: {
    name: {
      en: 'iFrame',
    },
    description: {
      en: 'Represents a nested browsing context, effectively embedding' +
      ' another HTML page into the current page.',
    },
    props_height: {
      en: 'height',
    },
    props_height_desc: {
      en: 'Indicates the height of the frame in pixels.',
    },
    props_name: {
      en: 'name',
    },
    props_name_desc: {
      en: 'A name for the embedded browsing context (or frame). This can be' +
      ' used as the value of the target attribute of Link or Form' +
      ' components, or the formtarget attribute of a TextField or Button' +
      ' components.',
    },
    props_sandbox: {
      en: 'sandbox',
    },
    props_sandbox_desc: {
      en: 'If specified as an empty string, this attribute enables extra' +
      ' restrictions on the content that can appear in the inline frame. The' +
      ' value of the attribute can either be an empty string (all the' +
      ' restrictions are applied), or a space-separated list of tokens that' +
      ' lift particular restrictions. See valid tokens on documentaion:' +
      ' https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe',
    },
    props_src: {
      en: 'src',
    },
    props_src_desc: {
      en: 'The URL of the page to embed.',
    },
    props_srcDoc: {
      en: 'srcdoc',
    },
    props_srcDoc_desc: {
      en: 'The content of the page that the embedded context is to contain. This attribute is expected to generally be used together with the sandbox attribute.',
    },
    props_width: {
      en: 'width',
    },
    props_width_desc: {
      en: 'Indicates the width of the frame in pixels.',
    },
  },
  tags: new Set(),
};
