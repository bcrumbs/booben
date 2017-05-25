'use strict';

import { basicColors, themeColors } from './constants';
import { foreground } from './helpers';

const foregroundColors = {
  main: foreground(basicColors.main),
  secondary: foreground(basicColors.secondary),
  alert: foreground(basicColors.red),
  success: foreground(basicColors.green),
  warning: foreground(basicColors.yellow),
  info: foreground(basicColors.lightblue),
};

export default {
  baseModule: 8,
  
  radiusDefault: 2,
  radiusRounded: '50%',

  fontSize: {
    '-2': 10,
    '-1': 12,
    0: 13,
    1: 15,
    2: 18,
    3: 24,
    4: 34,
    5: 45,
    6: 56,
    7: 112,
  },

  fontWeight: {
    light: '400',
    normal: '400',
    semibold: '600',
    bold: '700',
  },
  
  color: {
    white: basicColors.white,
    black: basicColors.black,
    transparent: basicColors.transparent,
    
    main: themeColors.main,
    mainFgTextColor: foregroundColors.main,
    secondary: themeColors.secondary,
    secondaryFgTextColor: foregroundColors.secondary,
    
    alert: themeColors.alert,
    alertFgTextColor: foregroundColors.alert,
    warning: themeColors.warning,
    warningFgTextColor: foregroundColors.warning,
    error: themeColors.alert,
    errorFgTextColor: foregroundColors.alert,
    success: themeColors.success,
    successFgTextColor: foregroundColors.success,
    info: themeColors.info,
    infoFgTextColor: foregroundColors.info,
  },

  paletteBlueGrey: {
    50: '#F9F9FA',
    75: '#EDEEF1',
    100: '#E8EAEE',
    200: '#D1D5DD',
    300: '#BAC0CB',
    400: '#8C96A9',
    500: '#667388',
    600: '#4C576A',
    700: '#333A45',
    800: '#1f2532',
    900: '#1A1D23',
  },
};
