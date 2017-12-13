import React from 'react';
import { PropBase } from '../PropBase/PropBase';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/blackboard.css';
import 'codemirror/mode/css/css';
import { EditorWrapperStyled } from './styles/EditorWrapperStyled';

const propTypes = {
  ...CodeMirror.propTypes,
  ...PropBase.propTypes,
};

const defaultProps = {
  ...PropBase.propTypes,
  mode: 'css',
};

export const PropCodeEditor = ({
  value,
  mode,
  label,
  onChange,
  ...props,
}) => {

  const content = (
    <EditorWrapperStyled>
      <CodeMirror
        className='jssy__code-editor'
        value={value}
        options={{
          mode: mode,
          theme: 'blackboard',
        }}
        onChange={onChange}
        {...props}
      />
    </EditorWrapperStyled>
  );

  return (
    <PropBase
      content={content}
      label={label}
      labelPositionTop
    />
  );
};

PropCodeEditor.propTypes = propTypes;
PropCodeEditor.defaultProps = defaultProps;
PropCodeEditor.displayName = 'PropCodeEditor';
