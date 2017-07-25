'use strict';

import { jssyTheme } from '@jssy/common-theme';

const fontWeightNormal = base => base.fontWeight.normal;
const colorTransparent = base => base.color.transparent;
const textColor = jssyTheme.jssy.paletteBlueGrey[200];
const textColorHover = jssyTheme.jssy.paletteBlueGrey[50];
const bgColorFocus = jssyTheme.jssy.paletteBlueGrey[500];

export default {
  components: {
    button: {
      iconOpacity: 1,
      
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
