'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import { noop } from '../../utils/misc';

import {
  FunctionEditorWrapperStyled,
} from './styles/FunctionEditorWrapperStyled';

import { FunctionEditorStyled } from './styles/FunctionEditorStyled';
import { HeadingStyled } from './styles/HeadingStyled';

const propTypes = {
  name: PropTypes.string,
  args: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
  })),
  code: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  name: '',
  args: [],
  code: '',
  onChange: noop,
};

const codeMirrorOptions = {
  mode: 'javascript',
  lineNumbers: true,
};

export const FunctionEditor = ({ name, args, code, onChange }) => {
  const header = `function ${name}(${args.map(arg => arg.name).join(', ')}) {`;
  const footer = '}';

  return (
    <FunctionEditorWrapperStyled>
      <HeadingStyled>
        <pre>
          {header}
        </pre>
      </HeadingStyled>

      <FunctionEditorStyled>
        <CodeMirror
          value={code}
          options={codeMirrorOptions}
          preserveScrollPosition
          onChange={onChange}
        />
      </FunctionEditorStyled>

      <HeadingStyled>
        <pre>
          {footer}
        </pre>
      </HeadingStyled>
    </FunctionEditorWrapperStyled>
  );
};

FunctionEditor.propTypes = propTypes;
FunctionEditor.defaultProps = defaultProps;
FunctionEditor.displayName = 'FunctionEditor';
