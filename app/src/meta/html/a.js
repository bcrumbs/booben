export default {
  displayName: 'a',
  textKey: 'name',
  descriptionTextKey: 'description',
  kind: 'container',
  group: 'basic',
  props: {
    href: {
      textKey: 'props_href',
      descriptionTextKey: 'props_href_desc',
      required: true,
      type: 'string',
      source: ['static', 'data'],
      sourceConfigs: {
        static: {
          default: 'javascript: void(0)',
        },
        data: {},
      },
    },
    download: {
      textKey: 'props_download',
      descriptionTextKey: 'props_download_desc',
      required: false,
      type: 'bool',
      source: ['static'],
      sourceConfigs: {
        static: {
          default: false,
        },
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
    rel: {
      textKey: 'props_rel',
      descriptionTextKey: 'props_rel_desc',
      required: false,
      type: 'oneOf',
      source: ['static'],
      options: [
        { value: 'alternate', textKey: 'props_rel_alternate' },
        { value: 'author', textKey: 'props_rel_author' },
        { value: 'bookmark', textKey: 'props_rel_bookmark' },
        { value: 'canonical', textKey: 'props_rel_canonical' },
        { value: 'external', textKey: 'props_rel_external' },
        { value: 'help', textKey: 'props_rel_help' },
        { value: 'icon', textKey: 'props_rel_icon' },
        { value: 'license', textKey: 'props_rel_license' },
        { value: 'manifest', textKey: 'props_rel_manifest' },
        { value: 'next', textKey: 'props_rel_next' },
        { value: 'nofollow', textKey: 'props_rel_nofollow' },
        { value: 'noreferrer', textKey: 'props_rel_noreferrer' },
        { value: 'noopener', textKey: 'props_rel_noopener' },
        { value: 'pingback', textKey: 'props_rel_pingback' },
        { value: 'preload', textKey: 'props_rel_preload' },
        { value: 'prev', textKey: 'props_rel_prev' },
        { value: 'search', textKey: 'props_rel_search' },
        { value: 'shortlink', textKey: 'props_rel_shortlink' },
        { value: 'stylesheet', textKey: 'props_rel_stylesheet' },
        { value: 'tag', textKey: 'props_rel_tag' },
      ],
      sourceConfigs: {
        static: {
          default: '',
        },
      },
    },
    target: {
      textKey: 'props_target',
      descriptionTextKey: 'props_target_desc',
      required: false,
      type: 'oneOf',
      source: ['static'],
      options: [
        { value: '_self', textKey: 'props_target_self' },
        { value: '_blank', textKey: 'props_target_blank' },
        { value: '_parent', textKey: 'props_target_parent' },
        { value: '_top', textKey: 'props_target_top' },
      ],
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
      en: 'Link',
    },
    description: {
      en: 'Specifies link to another destination.',
    },
    props_download: {
      en: 'Download',
    },
    props_download_desc: {
      en: 'Specifies that the target will be downloaded when a user clicks on the hyperlink.',
    },
    props_href: {
      en: 'href',
    },
    props_href_desc: {
      en: 'Contains a URL or a URL fragment that the hyperlink points to.',
    },
    props_hrefLang: {
      en: 'hreflang',
    },
    props_hrefLang_desc: {
      en: 'This attribute indicates the human language of the linked resource. It is purely advisory, with no built-in functionality. Allowed values are determined by BCP47.',
    },
    props_rel: {
      en: 'rel',
    },
    props_rel_desc: {
      en: 'Specifies the relationship between the current document and the linked document',
    },
    props_rel_alternate: {
      en: 'Alternate',
    },
    props_rel_author: {
      en: 'Author',
    },
    props_rel_bookmark: {
      en: 'Bookmark',
    },
    props_rel_canonical: {
      en: 'Canonical',
    },
    props_rel_external: {
      en: 'External',
    },
    props_rel_help: {
      en: 'Help',
    },
    props_rel_icon: {
      en: 'Icon',
    },
    props_rel_license: {
      en: 'License',
    },
    props_rel_manifest: {
      en: 'Manifest',
    },
    props_rel_next: {
      en: 'Next',
    },
    props_rel_nofollow: {
      en: 'Nofollow',
    },
    props_rel_noreferrer: {
      en: 'Noreferrer',
    },
    props_rel_noopener: {
      en: 'Noopener',
    },
    props_rel_pingback: {
      en: 'Pingback',
    },
    props_rel_preload: {
      en: 'Preload',
    },
    props_rel_prev: {
      en: 'Prev',
    },
    props_rel_search: {
      en: 'Search',
    },
    props_rel_shortlink: {
      en: 'Shortlink',
    },
    props_rel_stylesheet: {
      en: 'Stylesheet',
    },
    props_rel_tag: {
      en: 'Tag',
    },
    props_target: {
      en: 'target',
    },
    props_target_desc: {
      en: 'Specifies where to open the linked document',
    },
    props_target_self: {
      en: 'Self',
    },
    props_target_blank: {
      en: 'Blank',
    },
    props_target_parent: {
      en: 'Parent',
    },
    props_target_top: {
      en: 'Top',
    },
    props_type: {
      en: 'type',
    },
    props_type_desc: {
      en: 'Specifies the media type in the form of a MIME type for the linked URL.',
    },
  },
  tags: new Set(),
  placement: {
    inside: {
      exclude: [
        { component: 'a' },
        { component: 'Button' },
      ],
    },
  },
};
