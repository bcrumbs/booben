import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { PanelCollapsibleStyled } from './styles/PanelCollapsibleStyled';
import { HeaderBoxStyled } from './styles/HeaderBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { IconStyled } from './styles/IconStyled';

const propTypes = {
  title: PropTypes.string,
  collapsed: PropTypes.bool,
};

const defaultProps = {
  title: '',
  collapsed: false,
};

export const PanelCollapsible = props => (
  <PanelCollapsibleStyled>
    <HeaderBoxStyled>
      <TitleStyled>{props.title}</TitleStyled>
      <IconStyled>
        <Button
          icon={{ name: "chevron-down" }}
          colorScheme="flatLight"
          radius="rounded"
          size="small"
        />
      </IconStyled>
    </HeaderBoxStyled>

    {!props.collapsed && props.children}

  </PanelCollapsibleStyled>
);

PanelCollapsible.displayName = 'PanelCollapsible';
PanelCollapsible.propTypes = propTypes;
PanelCollapsible.defaultProps = defaultProps;

export * from './PanelCollapsibleItem/PanelCollapsibleItem';
