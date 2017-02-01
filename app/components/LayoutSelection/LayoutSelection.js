// TODO: Figure out WTF is this

'use strict';

import React from 'react';
import { Dialog } from '@reactackle/reactackle';

import './LayoutSelection.scss';

export const LayoutSelection = props => (
  <div className="layout-selection-modal-wrapper">
    <Dialog
      visible
      haveCloseButton
      title="Choose Layout"
    >
      <div className="layout-selection-wrapper">
        <div className="layout-selection-list">
          {props.children}
        </div>
      </div>
    </Dialog>
  </div>
);

LayoutSelection.displayName = 'LayoutSelection';

export * from './LayoutSelectionItem/LayoutSelectionItem';
