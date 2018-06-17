import React from 'react';
import Color from 'color';

import {
  themeColors,
  paletteBlueGrey,
  foregroundColors,
  fontSize,
  fontWeight,
} from './constants';

import { IconCross } from '../../components/icons';

import boobenTheme from './booben';

const fontColorBodyLight = paletteBlueGrey[25];
const fontColorMedium = paletteBlueGrey[400];
const colorBorder = paletteBlueGrey[500];
const colorBorderDark = paletteBlueGrey[650];
const colorMain = themeColors.main;
const fontSizeSmall = fontSize[-1];

const baseModule = 8;

const accordionConstants = {
  bgColor: 'inherit',
  bgColorHover: paletteBlueGrey[700],
};

export default {
  color: {
    main: colorMain,
    mainFgTextColor: foregroundColors.main,
    secondary: themeColors.secondary,
    secondaryFgTextColor: foregroundColors.secondary,
    error: themeColors.error,
    errorFgTextColor: foregroundColors.error,
    success: themeColors.success,
    successFgTextColor: foregroundColors.success,
    alert: themeColors.alert,
    alertFgTextColor: foregroundColors.alert,
    warning: themeColors.warning,
    warningFgTextColor: foregroundColors.warning,
  },

  colorBorder,

  fontColor: {
    light: paletteBlueGrey[300],
    medium: fontColorMedium,
  },

  fontSize,

  fontWeight,

  body: {
    backgroundColor: paletteBlueGrey[600],
    fontColor: fontColorBodyLight,
    fontColorAlt: paletteBlueGrey[900],
  },

  components: {
    accordion: {
      item: {
        title: {
          collapsed: {
            backgroundColor: accordionConstants.bgColor,
            textTransform: 'none',
            paddingLeft: baseModule * 2.5,

            hover: {
              backgroundColor: accordionConstants.bgColorHover,
            },

            focus: {
              backgroundColor: accordionConstants.bgColorHover,
            },
          },

          expanded: {
            backgroundColor: accordionConstants.bgColor,
            textTransform: 'none',
            paddingLeft: baseModule * 2.5,

            hover: {
              backgroundColor: accordionConstants.bgColorHover,
            },

            focus: {
              backgroundColor: accordionConstants.bgColorHover,
            },
          },
        },
      },

      separator: {
        color: colorBorderDark,
      },
    },

    button: {
      size: {
        small: {
          icon: {
            width: 24,
            imgSize: 18,
          },
        },
        normal: {
          icon: {
            width: 24,
            imgSize: 18,
          },
        },
      },

      disabled: {
        backgroundColor: boobenTheme.booben.color.stateHoverDark,
        fontColor: fontColorMedium,
      },

      colorScheme: {
        flatLight: {
          hover: {
            backgroundColor: boobenTheme.booben.color.stateHoverDark,
          },

          focus: {
            backgroundColor: boobenTheme.booben.color.stateFocusDark,
          },
        },
      },
    },

    checkbox: {
      label: {
        fontColor: fontColorBodyLight,
      },
    },

    dialog: {
      window: {
        backgroundColor: paletteBlueGrey[700],
        minWidth: 320,
        maxWidth: 540,
      },

      title: {
        fontSize: fontSize[2],
        color: colorMain,
        fontWeight: fontWeight.normal,
        paddingX: baseModule * 3,
        paddingY: baseModule * 3,
      },

      content: {
        paddingX: baseModule * 3,
        paddingY: baseModule * 3,
      },

      closeButton: {
        iconElement: <IconCross size="custom" color="currentColor" />,

        style: {
          color: fontColorBodyLight,

          hover: {
            color: fontColorBodyLight,
          },

          focus: {
            color: fontColorBodyLight,
          },
        },
      },
    },

    formItem: {
      spacing: baseModule * 1.5,
    },

    header: {
      header: {
        backgroundColor: paletteBlueGrey[700],

        fontColor: {
          light: paletteBlueGrey[50],
        },
      },
    },

    selectBox: {
      selectBox: {
        style: {
          borderColor: colorBorder,

          hover: {
            backgroundColor: boobenTheme.booben.color.stateHoverDark,
          },

          focus: {
            backgroundColor: boobenTheme.booben.color.stateFocusDark,
          },

          disabled: {
            borderColor: colorBorder,
          },
        },
      },

      optionsList: {
        backgroundColor: paletteBlueGrey[700],
      },

      option: {
        style: {
          hover: {
            backgroundColor: boobenTheme.booben.color.stateHoverDark,
          },

          focus: {
            backgroundColor: boobenTheme.booben.color.stateFocusDark,
          },
        },
      },
    },

    tabs: {
      tab: {
        fontSize: fontSize['-1'],
        minHeight: 40,
        maxWidth: '100%',

        style: {
          dark: {
            fontColor: paletteBlueGrey[300],
            opacity: 0.8,

            hover: {
              fontColor: paletteBlueGrey[300],
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              opacity: 0.9,
            },

            focus: {
              fontColor: paletteBlueGrey[300],
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              opacity: 1,
            },

            selected: {
              opacity: 1,
            },
          },
        },
      },
    },

    tag: {
      backgroundColor: paletteBlueGrey[700],
      textColor: paletteBlueGrey[50],
      fontSize: fontSizeSmall,

      content: {
        alignY: 'center',
      },
    },

    textfield: {
      textfield: {
        state: {
          borderColor: colorBorder,

          disabled: {
            borderColor: colorBorder,
          },
        },
      },

      placeholder: {
        fontColor: paletteBlueGrey[400],
      },

      message: {
        lineHeight: 1.25,
      },
    },

    toggleButton: {
      toggleBar: {
        state: {
          checked: {
            backgroundColor: Color(colorMain).lighten(0.9),
          },

          unchecked: {
            backgroundColor: paletteBlueGrey[500],
          },

          disabled: {
            backgroundColor: paletteBlueGrey[500],
          },
        },
      },

      toggleThumb: {
        state: {
          unchecked: {
            backgroundColor: paletteBlueGrey[300],
          },

          disabled: {
            backgroundColor: paletteBlueGrey[400],
          },
        },
      },
    },

    tooltipIcon: {
      diameter: 14,

      style: {
        fontColor: paletteBlueGrey[200],
        backgroundColor: paletteBlueGrey[500],

        hover: {
          fontColor: paletteBlueGrey[25],
          backgroundColor: colorMain,
        },

        focus: {
          fontColor: paletteBlueGrey[25],
          backgroundColor: colorMain,
        },
      },
    },
  },
};
