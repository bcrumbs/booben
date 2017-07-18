'use strict';

import { baseModule } from '../../../styles/themeSelectors';

const baseHeight = ({ theme }) =>
  theme.reactackle.components.button.size.normal.minHeight;

export default {
  action: {
    marginY: 0,
    marginX: baseModule(0.5),
  },
  item: {
    baseHeight,
  },
};
