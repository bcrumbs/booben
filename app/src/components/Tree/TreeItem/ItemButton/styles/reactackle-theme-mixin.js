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
            width: constants.buttonSize,
            height: constants.buttonSize,
            imgSize: constants.buttonImgSize,
          },
        },
      },
    },
  },
};
