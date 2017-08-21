import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs } from '@reactackle/reactackle';
import { TitleStyled } from './styles/TitleStyled';
import { NameStyled } from './styles/NameStyled';
import { BreadcrumbsStyled } from './styles/BreadcrumbsStyled';

import {
  DataFlowBlockHeadingStyled,
} from './styles/DataFlowBlockHeadingStyled';

const propTypes = {
  breadcrumbs: PropTypes.shape(...Breadcrumbs),
  title: PropTypes.string,
  name: PropTypes.string.isRequired,
};

const defaultProps = {
  breadcrumbs: null,
  title: '',
};

export const DataFlowBlockHeading = props => (
  <DataFlowBlockHeadingStyled>
    {props.breadcrumbs && (
      <BreadcrumbsStyled>
        <Breadcrumbs {...props.breadcrumbs} overflow />
      </BreadcrumbsStyled>
    )}
    {props.title && <TitleStyled>{props.title}</TitleStyled>}
    {props.name && <NameStyled>{props.name}</NameStyled>}
  </DataFlowBlockHeadingStyled>
);

DataFlowBlockHeading.displayName = 'DataFlowBlockHeading';
