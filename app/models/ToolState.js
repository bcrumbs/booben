/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record } from 'immutable';

export default Record({
  closed: false,
  docked: true,
  zIndex: 0,
  sideRegionIsVisible: false,
  isInDockRegion: false,
  isActiveInToolsPanel: false,
  activeSection: 0,
});
