import {
  baseModule,
  paletteBlueGrey25,
  paletteBlueGrey500,
  paletteBlueGrey650,
  paletteBlueGrey700,
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
  basePaddingX: baseModule(1.5),
  basePaddingY: baseModule(2),

  title: {
    elementsSpacing: baseModule(1),
    fontSize: 15,
    lineHeight: 1.5,
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
      color: textColorBody,
      placeholderColor: textColorMedium,
      borderColor: borderColor,
      borderColorActive: colorMain,
    },
    
    titleIcon: {
      color: textColorMedium,
    },
  
    placeholder: {
      bgColor: paletteBlueGrey25,
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
      bgColor: paletteBlueGrey650,
      textColor: textColorMedium,
    },
  
    shading: {
      default: {
        backgroundColor: 'transparent',
      },
    
      dim: {
        backgroundColor: paletteBlueGrey700,
      },
    
      editing: {
        backgroundColor: colorActiveBgLight,
      },
    },
  },
};
