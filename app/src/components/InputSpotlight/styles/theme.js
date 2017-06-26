/**
 * @author Ekaterina Marova
 */

'use strict';

import {
  baseModule,
  fontSizeTitle,
} from '../../../styles/themeSelectors';

export const inputSpotlightTheme = {
  input: {
    paddingY: baseModule(2),
    paddingX: baseModule(3),
    lineHeight: 32,
    fontSize: fontSizeTitle,
  },
  
  options: {
    paddingX: baseModule(1.5),
  },
};

export const inputMixin = {
  components: {
    input: {
      input: {
        bordered: {
          size: {
            fullWidth: {
              paddingY: inputSpotlightTheme.paddingY,
              paddingX: inputSpotlightTheme.paddingX,
              lineHeight: inputSpotlightTheme.lineHeight,
              fontSize: inputSpotlightTheme.fontSize,
            },
          },
        },
        
        underlined: {
          size: {
            fullWidth: {
              paddingY: inputSpotlightTheme.paddingY,
              paddingX: inputSpotlightTheme.paddingX,
              lineHeight: inputSpotlightTheme.lineHeight,
              fontSize: inputSpotlightTheme.fontSize,
            },
          },
        },
      },
    },
  },
};
