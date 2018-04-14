import {
  colorBgDefault,
  colorBorderDark,
  colorActiveBgLight,
} from '../../../styles/themeSelectors';

const borderColor = colorBorderDark;

export default {
  actionWidth: 38,
  actionHeight: 38,
  placeholderSize: 28,
  verticalBorderWidth: 2,

  content: {
    borderColor,
    bgColor: colorBgDefault,
  },

  actions: {
    borderColor,
    bgColor: colorBgDefault,
    groupSeparatorColor: borderColor,

    placeholder: {
      borderColor,
      bgColor: colorActiveBgLight,
    },

    action: {
      bgColor: 'transparent',
      activeBgColor: colorActiveBgLight,
    },
  },
};
