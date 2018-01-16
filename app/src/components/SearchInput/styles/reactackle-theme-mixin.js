/**
 * @author Ekaterina Marova
 */

const oneAndHalfBaseModule = base => base.baseModule * 1.5;
const twoBaseModules = base => base.baseModule * 2;
const threeBaseModules = base => base.baseModule * 3;
const fontSizeTwo = base => base.fontSize[2];

export default {
  components: {
    textfield: {
      textfield: {
        size: {
          denseFullWidth: {
            paddingY: 6,
          }
        },

        iconInner: {
          size: {
            denseFullWidth: {
              imgSize: 32,
            },
          }
        }
      },
    },
  },
};
