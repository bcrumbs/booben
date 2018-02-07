import {
  colorMain,
  colorBorder,
  colorBorderDark,
  paletteBlueGrey25,
  paletteBlueGrey500,
  colorActiveBg,
  colorActiveBgLight,
  textColorBody,
  textColorBodyAlt,
} from '../../../styles/themeSelectors';

export default {
  borderWidth: 1,

  light: {
    separatorColor: colorBorder,

    tag: {
      fontColor: textColorBodyAlt,
      fontColorFocused: colorMain,
      bgColorHover: paletteBlueGrey25,
      bgColorFocused: colorActiveBg,
    },
  },

  dark: {
    separatorColor: colorBorderDark,

    tag: {
      fontColor: textColorBody,
      fontColorFocused: textColorBody,
      bgColorHover: colorActiveBgLight,
      bgColorFocused: colorActiveBgLight,
    },
  },
};
