/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import patchComponent from '../../../hocs/patchComponent';

const LCOLOR = 'rgba(255,255,255,0.3)',
  LCOLOR_LRG = 'rgba(255,255,255,1)',
  LWIDTH = 1,
  LWIDTH_LRG = 2,
  CSIZE = 20,
  CSIZE_LRG = 100,
  COFFSET_LRG = 40 - LWIDTH_LRG / 2;

const style = {
  width: '100%',
  minHeight: '180px',
  backgroundColor: 'rgba(33, 150, 243, 0.15',
  borderRadius: '2px',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  outlineOffset: '-20px',
  backgroundImage: `
    linear-gradient(${LCOLOR_LRG} ${LWIDTH_LRG}px, transparent ${LWIDTH_LRG}px),
    linear-gradient(90deg, ${LCOLOR_LRG} ${LWIDTH_LRG}px,
      transparent ${LWIDTH_LRG}px),
    linear-gradient(${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px),
    linear-gradient(90deg, ${LCOLOR} ${LWIDTH}px, transparent ${LWIDTH}px)
  `,
  backgroundSize: `
    ${CSIZE_LRG}px ${CSIZE_LRG}px,
    ${CSIZE_LRG}px ${CSIZE_LRG}px,
    ${CSIZE}px ${CSIZE}px,
    ${CSIZE}px ${CSIZE}px
  `,
  backgroundPosition: `
    ${COFFSET_LRG}px ${COFFSET_LRG}px,
    ${COFFSET_LRG}px ${COFFSET_LRG}px,
    -${LWIDTH}px -${LWIDTH}px,
    -${LWIDTH}px -${LWIDTH}px
  `,
};

const outletContentStyle = {
  maxWidth: '20em',
  fontSize: '24px',
  lineHeight: '1.5',
  color: '#BAC0CB',
  textAlign: 'center',
  margin: 'auto',
};

const _Outlet = () => (
  <div style={style}>
    <div style={outletContentStyle}>
      Outlet
    </div>
  </div>
);

_Outlet.displayName = 'Outlet';

export const Outlet = patchComponent(_Outlet);
