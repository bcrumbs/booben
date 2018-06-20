import Color from 'color';
import { boobenTheme } from '../../../../styles/theme';

const fontWeightNormal = base => base.fontWeight.normal;
const colorTransparent = base => base.color.transparent;
const textColor = boobenTheme.booben.paletteBlueGrey[75];
const textColorHover = base => base.color.white;
const disabledColor = Color(boobenTheme.booben.paletteBlueGrey[400]).fade(0.35);
const bgColorFocus = boobenTheme.booben.paletteBlueGrey[500];

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
