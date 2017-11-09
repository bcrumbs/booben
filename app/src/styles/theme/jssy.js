import Color from 'color';

import {
  paletteBlueGrey,
  paletteRed,
  paletteAmber,
  paletteLightBlue,
} from './constants';

export default {
  jssy: {
    color: {
      lightBlue: '#2196F3',
      
      stateSelection: Color(paletteLightBlue[300]).fade(0.8).string(),
      stateHover: Color(paletteBlueGrey[300]).fade(0.8).string(),
      stateHoverDark: Color(paletteBlueGrey[900]).fade(0.8).string(),
      stateFocus: Color(paletteBlueGrey[300]).fade(0.7).string(),
      stateFocusDark: Color(paletteBlueGrey[900]).fade(0.7).string(),
      
      bgDefault: paletteBlueGrey[600],
      bgXLight: paletteBlueGrey[400],
      bgLight: paletteBlueGrey[500],
      bgMedium: paletteBlueGrey[650],
      bgDark: paletteBlueGrey[700],
    },

    paletteBlueGrey,
    paletteRed,
    paletteAmber,
    paletteLightBlue,
  },
};
