'use strict';

//noinspection JSUnresolvedVariable
import React from 'react';
import './ComponentHandlers.scss';

export const ComponentHandlers = props => (
  <div className="component-handlers">
    {props.children}
  </div>
);

ComponentHandlers.displayName = 'ComponentHandlers';

export * from './ComponentHandler/ComponentHandler';
