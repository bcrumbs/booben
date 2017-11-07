import { foreground } from './utils';

export const paletteBlueGrey = {
  25: '#F4F5FA',
  50: '#ECEFF7',
  75: '#E1E4ED',
  100: '#D5DAE3',
  200: '#C2C5D1',
  300: '#B0B6C4',
  400: '#929caf',
  500: '#6b788e',
  550: '#586074',
  600: '#4C576A',
  650: '#404b60',
  700: '#333A45',
  800: '#1f2532',
  900: '#1A1D23',
};

export const paletteRed = {
  50: '#FFEBEE',
  100: '#FFCDD2',
  200: '#EF9A9A',
  300: '#E57373',
  400: '#EF5350',
  500: '#F44336',
  600: '#E53935',
  700: '#D32F2F',
  800: '#C62828',
  900: '#B71C1C',
  a100: '#FF8A80',
  a200: '#FF5252',
  a400: '#FF1744',
  a700: '#D50000',
};

export const paletteAmber = {
  50: '#FFF8E1',
  100: '#FFECB3',
  200: '#FFE082',
  300: '#FFD54F',
  400: '#FFCA28',
  500: '#FFC107',
  600: '#FFB300',
  700: '#FFA000',
  800: '#FF8F00',
  900: '#FF6F00',
  a100: '#FFE57F',
  a200: '#FFD740',
  a400: '#FFC400',
  a700: '#FFAB00',
};

export const paletteLightBlue = {
  50: '#E1F5FE',
  100: '#B3E5FC',
  200: '#81D4FA',
  300: '#4FC3F7',
  400: '#29B6F6',
  500: '#03A9F4',
  600: '#039BE5',
  700: '#0288D1',
  800: '#0277BD',
  900: '#01579B',
  a100: '#80D8FF',
  a200: '#40C4FF',
  a400: '#00B0FF',
  a700: '#0091EA',
};

export const paletteLightGreen = {
  50: '#F1F8E9',
  100: '#DCEDC8',
  200: '#C5E1A5',
  300: '#AED581',
  400: '#9CCC65',
  500: '#8BC34A',
  600: '#7CB342',
  700: '#689F38',
  800: '#558B2F',
  900: '#33691E',
  a100: '#CCFF90',
  a200: '#B2FF59',
  a400: '#76FF03',
  a700: '#64DD17',
};

export const themeColors = {
  main: paletteLightBlue[500],
  secondary: paletteLightBlue[500],
  error: paletteRed[200],
  alert: paletteRed[200],
  success: paletteLightGreen[200],
  warning: paletteAmber[500],
};

export const foregroundColors = {
  main: foreground(themeColors.main),
  secondary: foreground(themeColors.secondary),
  error: foreground(themeColors.secondary),
  success: foreground(themeColors.secondary),
  alert: foreground(themeColors.secondary),
  warning: foreground(themeColors.secondary),
};

export const fontWeight = {
  light: '400',
  normal: '400',
  semibold: '600',
  bold: '700',
};

export const fontSize = {
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
};
