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
  spreadLastArg: PropTypes.bool,
  code: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  name: '',
  args: [],
  spreadLastArg: false,
  code: '',
  onChange: noop,
};

const codeMirrorOptions = {
  mode: 'javascript',
  lineNumbers: true,
};

export const FunctionEditor = ({
  name,
  args,
  spreadLastArg,
  code,
  onChange,
}) => {
  const argsString = spreadLastArg
    ? args.map(
        (arg, i) => i === args.length - 1
          ? `...${arg.name}`
          : arg.name,
      )
      .join(', ')
    : args.map(arg => arg.name).join(', ');

  const header = `function ${name}(${argsString})`;
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
