/**
 * @author Dmitriy Bizyaev
 */

import _mapValues from 'lodash.mapvalues';
import a from './html/a';
import abbr from './html/abbr';
import address from './html/address';
import area from './html/area';
import article from './html/article';
import aside from './html/aside';
import audio from './html/audio';
import b from './html/b';
import bdi from './html/bdi';
import bdo from './html/bdo';
import blockquote from './html/blockquote';
import br from './html/br';
import button from './html/button';
import canvas from './html/canvas';
import caption from './html/caption';
import cite from './html/cite';
import code from './html/code';
import col from './html/col';
import colgroup from './html/colgroup';
import datalist from './html/datalist';
import dd from './html/dd';
import del from './html/del';
import details from './html/details';
import dfn from './html/dfn';
import div from './html/div';
import dl from './html/dl';
import dt from './html/dt';
import em from './html/em';
import embed from './html/embed';
import fieldset from './html/fieldset';
import figcaption from './html/figcaption';
import figure from './html/figure';
import footer from './html/footer';
import form from './html/form';
import h1 from './html/h1';
import h2 from './html/h2';
import h3 from './html/h3';
import h4 from './html/h4';
import h5 from './html/h5';
import h6 from './html/h6';
import header from './html/header';
import hr from './html/hr';
import i from './html/i';
import iframe from './html/iframe';
import img from './html/img';
import input from './html/input';
import ins from './html/ins';
import kbd from './html/kbd';
import keygen from './html/keygen';
import label from './html/label';
import legend from './html/legend';
import li from './html/li';
import main from './html/main';
import map from './html/map';
import mark from './html/mark';
import meter from './html/meter';
import nav from './html/nav';
import noscript from './html/noscript';
import object from './html/object';
import ol from './html/ol';
import optgroup from './html/optgroup';
import option from './html/option';
import output from './html/output';
import p from './html/p';
import param from './html/param';
import picture from './html/picture';
import pre from './html/pre';
import progress from './html/progress';
import q from './html/q';
import rp from './html/rp';
import rt from './html/rt';
import ruby from './html/ruby';
import s from './html/s';
import samp from './html/samp';
import section from './html/section';
import select from './html/select';
import small from './html/small';
import source from './html/source';
import span from './html/span';
import strong from './html/strong';
import sub from './html/sub';
import summary from './html/summary';
import sup from './html/sup';
import table from './html/table';
import tbody from './html/tbody';
import td from './html/td';
import textarea from './html/textarea';
import tfoot from './html/tfoot';
import th from './html/th';
import thead from './html/thead';
import time from './html/time';
import tr from './html/tr';
import track from './html/track';
import u from './html/u';
import ul from './html/ul';
import var_ from './html/var';
import video from './html/video';
import wbr from './html/wbr';
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
    table: {
      textKey: 'group_table',
      descriptionTextKey: 'group_table_desc',
    },
    media: {
      textKey: 'group_media',
      descriptionTextKey: 'group_media_desc',
    },
    lists: {
      textKey: 'group_lists',
      descriptionTextKey: 'group_lists_desc',
    },
    text: {
      textKey: 'group_text',
      descriptionTextKey: 'group_text_desc',
    },
    forms: {
      textKey: 'group_forms',
      descriptionTextKey: 'group_forms_desc',
    },
    blocks: {
      textKey: 'group_blocks',
      descriptionTextKey: 'group_blocks_desc',
    },
    special: {
      textKey: 'group_special',
      descriptionTextKey: 'group_special_desc',
    },
  },
  strings: {
    group_table: {
      en: 'Tables',
    },
    group_table_desc: {
      en: '',
    },
    group_media: {
      en: 'Media',
    },
    group_media_desc: {
      en: '',
    },
    group_lists: {
      en: 'Lists',
    },
    group_lists_desc: {
      en: '',
    },
    group_text: {
      en: 'Text formatting',
    },
    group_text_desc: {
      en: '',
    },
    group_forms: {
      en: 'Forms and form controls',
    },
    group_forms_desc: {
      en: '',
    },
    group_blocks: {
      en: 'Page blocks and sections',
    },
    group_blocks_desc: {
      en: '',
    },
    group_special: {
      en: 'Special elements',
    },
    group_special_desc: {
      en: '',
    },
  },
  components: _mapValues({
    a,
    abbr,
    address,
    area,
    article,
    aside,
    audio,
    b,
    bdi,
    bdo,
    blockquote,
    br,
    button,
    canvas,
    caption,
    cite,
    code,
    col,
    colgroup,
    datalist,
    dd,
    del,
    details,
    dfn,
    div,
    dl,
    dt,
    em,
    embed,
    fieldset,
    figcaption,
    figure,
    footer,
    form,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    header,
    hr,
    i,
    iframe,
    img,
    input,
    ins,
    kbd,
    keygen,
    label,
    legend,
    li,
    main,
    map,
    mark,
    meter,
    nav,
    noscript,
    object,
    ol,
    optgroup,
    option,
    output,
    p,
    param,
    picture,
    pre,
    progress,
    q,
    rp,
    rt,
    ruby,
    s,
    samp,
    section,
    select,
    small,
    source,
    span,
    strong,
    sub,
    summary,
    sup,
    table,
    tbody,
    td,
    textarea,
    tfoot,
    th,
    thead,
    time,
    tr,
    track,
    u,
    ul,
    var: var_,
    video,
    wbr,
  }, addCommonProps),
};
