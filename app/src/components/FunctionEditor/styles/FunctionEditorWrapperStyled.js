import styled from 'styled-components';

const fontFamily = ({ theme }) => `
  &,
  & * {
    font-family: ${theme.reactackle.fontFamily.monospace};
  }
`;

export const FunctionEditorWrapperStyled = styled.div`
  ${fontFamily}
`;

FunctionEditorWrapperStyled.displayName = 'FunctionEditorWrapperStyled';
