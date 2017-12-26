import React from 'react';
import PropTypes from 'prop-types';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/blackboard.css';
import 'codemirror/mode/css/css';
import _pick from 'lodash.pick';
import { PropBase } from '../PropBase/PropBase';
import { EditorWrapperStyled } from './styles/EditorWrapperStyled';

const propTypes = {
  ...PropBase.propTypes,
  ...CodeMirror.propTypes,
  mode: PropTypes.string,
};

const defaultProps = {
  ...PropBase.defaultProps,
  ...CodeMirror.defaultProps,
  mode: 'css',
};

const baseProps = Object.keys(PropBase.propTypes);
const codeMirrorProps = Object.keys(CodeMirror.propTypes);

export const PropCodeEditor = ({ mode, ...props }) => {
  const propsForCodeMirror = _pick(props, codeMirrorProps);

  const content = (
    <EditorWrapperStyled>
      <CodeMirror
        {...propsForCodeMirror}
        className="jssy__code-editor"
        options={{ mode, theme: 'blackboard' }}
      />
    </EditorWrapperStyled>
  );

  const propsForBase = _pick(props, baseProps);

  return (
    <PropBase
      {...propsForBase}
      content={content}
      labelPositionTop
    />
  );
};

PropCodeEditor.propTypes = propTypes;
PropCodeEditor.defaultProps = defaultProps;
PropCodeEditor.displayName = 'PropCodeEditor';
