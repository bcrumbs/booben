import constants from '../../../styles/constants';

export default {
  components: {
    button: {
      iconOpacity: 1,

      size: {
        inline: {
          minHeight: constants.buttonSize,
          fontSize: constants.buttonSize,
          lineHeight: 1,

          icon: {
            width: 14,
            height: null,
            imgSize: null,
          },
        },
      },

      colorScheme: {
        flatLight: {
          hover: {
            backgroundColor: 'transparent',
          },

          focus: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
};
