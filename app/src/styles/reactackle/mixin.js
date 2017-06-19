/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
  themeColors,
  paletteBlueGrey,
  colorsFgCalculated,
} from '../constants';

export default {
  color: {
    main: themeColors.main,
    mainFgTextColor: colorsFgCalculated.main,
    secondary: themeColors.secondary,
    secondaryFgTextColor: colorsFgCalculated.secondary,
  },
  
  colorBorder: paletteBlueGrey[75],
  
  fontColor: {
    light: paletteBlueGrey[300],
    medium: paletteBlueGrey[400],
  },
  
  components: {
    input: {
      message: {
        lineHeight: 1.25,
      },
    },
  },
};
