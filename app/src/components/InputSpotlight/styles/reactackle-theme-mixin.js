/**
 * @author Ekaterina Marova
 */

const twoBaseModules = base => base.baseModule * 2;
const threeBaseModules = base => base.baseModule * 3;
const fontSizeTwo = base => base.fontSize[2];

export default {
  components: {
    input: {
      input: {
        bordered: {
          size: {
            fullWidth: {
              paddingY: twoBaseModules,
              paddingX: threeBaseModules,
              lineHeight: '32px',
              fontSize: fontSizeTwo,
            },
          },
        },
        
        underlined: {
          size: {
            fullWidth: {
              paddingY: twoBaseModules,
              paddingX: threeBaseModules,
              lineHeight: '32px',
              fontSize: fontSizeTwo,
            },
          },
        },
      },
    },
  },
};
