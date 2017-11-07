import {
  colorBgDefault,
  colorBorderDark,
  colorActiveBgLight,
} from '../../../styles/themeSelectors';

const borderColor = colorBorderDark;

export default {
  actionWidth: 34,
  placeholderSize: 28,
  
  content: {
    bgColor: colorBgDefault,
    borderColor: borderColor,
  },
  
  actions: {
    bgColor: colorBgDefault,
    borderColor: borderColor,
    groupSeparatorColor: borderColor,
    
    placeholder: {
      bgColor: colorActiveBgLight,
      borderColor: borderColor,
    },
    
    action: {
      bgColor: 'transparent',
      activeBgColor: colorActiveBgLight,
    },
  },
};
