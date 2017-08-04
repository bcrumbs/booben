'use strict';

const baseHeight = ({ theme }) =>
  theme.reactackle.components.button.size.normal.minHeight;

export default {
  action: {
    marginY: 0,
    marginX: 0,
  },
  item: {
    baseHeight,
  },
};
