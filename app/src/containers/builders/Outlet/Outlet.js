/**
 * @author Dmitriy Bizyaev
 */

import React from 'react';
import patchComponent from '../../../hocs/patchComponent';

const LCOLOR = 'rgba(255,255,255,0.3)';
const LCOLOR_LRG = 'rgba(255,255,255,1)';
const LWIDTH = 1;
const LWIDTH_LRG = 2;
const CSIZE = 20;
const CSIZE_LRG = 100;
const COFFSET_LRG = 40 - LWIDTH_LRG / 2;

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
  fontSize: '15px',
  lineHeight: '1',
  color: '#BAC0CB',
  textAlign: 'center',
  margin: 'auto',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: '600',
  backgroundColor: 'white',
  fontFamily: 'Open Sans, sans-serif',
  padding: '4px 8px',
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
