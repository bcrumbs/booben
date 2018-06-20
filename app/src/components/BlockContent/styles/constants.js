import {
  baseModule,
  paletteBlueGrey25,
  paletteBlueGrey500,
  paletteBlueGrey800,
  colorMain,
  colorBorderDark,
  colorActiveBg,
  colorActiveBgLight,
  textColorMedium,
  textColorBody,
  textColorBodyAlt,
} from '../../../styles/themeSelectors';

const borderColor = colorBorderDark;

export default {
  basePaddingX: baseModule(2.5),
  basePaddingY: baseModule(2.5),

  title: {
    minHeight: 38,
    elementsSpacing: baseModule(1),
    fontSize: 15,
    lineHeight: 1.5,
    paddingY: baseModule(0.5),
    actionsPaddingRight: baseModule(1.5),
    actionsSpacing: baseModule(0.125),
  },

  default: {
    blocksSeparatorColor: borderColor,
    subtitleColor: textColorMedium,

    content: {
      bgColor: 'transparent',
    },

    contentHeading: {
      textColor: textColorMedium,
    },

    title: {
      borderColor,
      color: textColorBody,
      placeholderColor: textColorMedium,
      borderColorActive: colorMain,
    },

    titleIcon: {
      color: textColorMedium,
    },

    placeholder: {
      textColor: textColorMedium,
    },

    shading: {
      default: {
        backgroundColor: 'transparent',
      },

      dim: {
        backgroundColor: paletteBlueGrey25,
      },

      editing: {
        backgroundColor: colorActiveBg,
      },
    },
  },

  alt: {
    blocksSeparatorColor: paletteBlueGrey500,
    subtitleColor: textColorMedium,

    content: {
      bgColor: 'transparent',
    },

    contentHeading: {
      textColor: textColorMedium,
    },

    title: {
      color: textColorBodyAlt,
      placeholderColor: textColorMedium,
      borderColor: paletteBlueGrey500,
      borderColorActive: colorMain,
    },

    titleIcon: {
      color: textColorMedium,
    },

    placeholder: {
      textColor: textColorMedium,
    },

    shading: {
      default: {
        backgroundColor: 'transparent',
      },

      dim: {
        backgroundColor: paletteBlueGrey800,
      },

      editing: {
        backgroundColor: colorActiveBgLight,
      },
    },
  },
};
