import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs, Icon } from '@reactackle/reactackle';
import { HeadingStyled } from './styles/HeadingStyled';
import { TitleBoxStyled } from './styles/TitleBoxStyled';
import { TitleStyled } from './styles/TitleStyled';
import { IconStyled } from './styles/IconStyled';
import { BreadcrumbsStyled } from './styles/BreadcrumbsStyled';

import {
  GraphQLGroupStyled,
} from './styles/GraphQLGroupStyled';

const propTypes = {
  breadcrumbs: PropTypes.shape(...Breadcrumbs),
  title: PropTypes.string,
  collapsed: PropTypes.bool,
};

const defaultProps = {
  breadcrumbs: null,
  title: '',
  collapsed: false,
};

export const GraphQLGroup = props => (
  <GraphQLGroupStyled>
    <HeadingStyled>
      <TitleBoxStyled>
        {props.breadcrumbs && (
          <BreadcrumbsStyled>
            <Breadcrumbs {...props.breadcrumbs} overflow />
          </BreadcrumbsStyled>
        )}
        <TitleStyled>{props.title}</TitleStyled>
      </TitleBoxStyled>
      <IconStyled collapsed={props.collapsed}>
        <Icon name="chevron-down" size="small" />
      </IconStyled>
    </HeadingStyled>

    {!props.collapsed && props.children}
  </GraphQLGroupStyled>
);

GraphQLGroup.displayName = 'GraphQLGroup';
GraphQLGroup.propTypes = propTypes;
GraphQLGroup.defaultProps = defaultProps;
