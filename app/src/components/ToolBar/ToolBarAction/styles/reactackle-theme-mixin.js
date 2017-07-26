'use strict';

import Color from 'color';
import { jssyTheme } from '@jssy/common-theme';

const fontWeightNormal = base => base.fontWeight.normal;
const colorTransparent = base => base.color.transparent;
const textColor = jssyTheme.jssy.paletteBlueGrey[75];
const textColorHover = base => base.color.white;
const disabledColor = Color(jssyTheme.jssy.paletteBlueGrey[400]).fade(0.35);
const bgColorFocus = jssyTheme.jssy.paletteBlueGrey[500];

export default {
  components: {
    button: {
      iconOpacity: 1,
  
      disabled: {
        backgroundColor: 'transparent',
        fontColor: disabledColor,
      },
      
      text: {
        textTransform: 'none',
        fontWeight: fontWeightNormal,
      },
  
      colorScheme: {
        flatLight: {
          backgroundColor: colorTransparent,
          fontColor: textColor,
    
          hover: {
            backgroundColor: colorTransparent,
            fontColor: textColorHover,
          },
    
          focus: {
            backgroundColor: bgColorFocus,
            fontColor: textColorHover,
          },
        },
      },
    },
  },
};
