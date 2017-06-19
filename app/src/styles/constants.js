import { foreground } from '@reactackle/reactackle';

export const paletteBlueGrey = {
  25: '#F4F5FA',
  50: '#ECEFF7',
  75: '#E1E4ED',
  100: '#D5DAE3',
  200: '#C2C5D1',
  300: '#B0B6C4',
  400: '#929caf',
  500: '#667388',
  600: '#4C576A',
  700: '#333A45',
  800: '#1f2532',
  900: '#1A1D23',
};

export const themeColors = {
  main: '#2196F3',
  secondary: '#673AB7',
};

export const colorsFgCalculated = {
  main: foreground(themeColors.main),
  secondary: foreground(themeColors.secondary),
};
