import _mapValues from 'lodash.mapvalues';
import a from './html/a';
import audio from './html/audio';
import blockquote from './html/blockquote';
import code from './html/code';
import div from './html/div';
import h1 from './html/h1';
import h2 from './html/h2';
import h3 from './html/h3';
import h4 from './html/h4';
import h5 from './html/h5';
import h6 from './html/h6';
import hr from './html/hr';
import iframe from './html/iframe';
import img from './html/img';
import li from './html/li';
import ol from './html/ol';
import p from './html/p';
import span from './html/span';
import table from './html/table';
import tbody from './html/tbody';
import td from './html/td';
import tfoot from './html/tfoot';
import thead from './html/thead';
import tr from './html/tr';
import ul from './html/ul';
import video from './html/video';
import commonProps from './html/common/props';
import commonStrings from './html/common/strings';

const addCommonProps = component => {
  component.props = { ...commonProps, ...component.props };
  component.strings = { ...commonStrings, ...component.strings };
  return component;
};

export default {
  namespace: 'HTML',
  globalStyle: false,
  containerStyle: null,
  componentGroups: {
    basic: {
      textKey: 'group_basic',
      descriptionTextKey: 'group_basic_desc',
    },
    text: {
      textKey: 'group_text',
      descriptionTextKey: 'group_text_desc',
    },
    media: {
      textKey: 'group_media',
      descriptionTextKey: 'group_media_desc',
    },
    table: {
      textKey: 'group_table',
      descriptionTextKey: 'group_table_desc',
    },
  },
  strings: {
    group_basic: {
      en: 'Page blocks',
    },
    group_basic_desc: {
      en: '',
    },
    group_text: {
      en: 'Typography',
    },
    group_text_desc: {
      en: '',
    },
    group_media: {
      en: 'Media',
    },
    group_media_desc: {
      en: '',
    },
    group_table: {
      en: 'Table',
    },
    group_table_desc: {
      en: '',
    },
  },

  components: _mapValues({
    a,
    audio,
    blockquote,
    code,
    div,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hr,
    iframe,
    img,
    li,
    ol,
    p,
    span,
    table,
    tbody,
    td,
    tfoot,
    thead,
    tr,
    ul,
    video,
  }, addCommonProps),
};
