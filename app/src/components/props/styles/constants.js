import {
  textColorBody,
  paletteBlueGrey50,
} from '../../../styles/themeSelectors';

const baseHeight = ({ theme }) =>
  theme.reactackle.components.button.size.normal.minHeight;

export default {
  action: {
    marginY: 0,
    marginX: 1,
  },

  item: {
    baseHeight,
  },

  light: {
    label: {
      fontColor: textColorBody,
    },
  },

  dark: {
    label: {
      fontColor: paletteBlueGrey50,
    },
  },
};
