import {
  colorBgDefault,
  colorBorderDark,
  colorActiveBgLight,
} from '../../../styles/themeSelectors';

const borderColor = colorBorderDark;

export default {
  actionWidth: 34,
  actionHeight: 32,
  placeholderSize: 28,

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
