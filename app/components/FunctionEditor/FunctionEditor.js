'use strict';

// noinspection JSUnresolvedVariable
import React from 'react';
import { BlockContentBoxItem } from '../BlockContent/BlockContent';
import './FunctionEditor.scss';

export const FunctionEditor = () => (
  <div className="function-editor" >
    <div className="function-editor_heading">
      <BlockContentBoxItem isBordered>
        <pre>
          function myFunction (
            arg1 (string), arg2 (bool)
          )
        </pre>
      </BlockContentBoxItem>
    </div>
    <div className="function-editor_wrapper">
      Here&amp;ll be editor
    </div>
  </div>
);

FunctionEditor.displayName = 'FunctionEditor';
