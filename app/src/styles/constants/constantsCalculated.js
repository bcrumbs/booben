import { foreground } from '../styleFunctions';
import { basicColors } from './constants';

// TODO: get rid of this file
export const colorsFgCalculated = {
  main: foreground(basicColors.main),
  secondary: foreground(basicColors.secondary),
  alert: foreground(basicColors.red),
  success: foreground(basicColors.green),
  warning: foreground(basicColors.yellow),
  info: foreground(basicColors.lightblue),
};
