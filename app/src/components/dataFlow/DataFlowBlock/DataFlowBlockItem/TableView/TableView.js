import React from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from '@reactackle/reactackle';
import { TableViewStyled } from './styles/TableViewStyled';
import { TitleStyled } from './styles/TitleStyled';
import { DescriptionStyled } from './styles/DescriptionStyled';
import { DescriptionTextStyled } from './styles/DescriptionTextStyled';

const propTypes = {
  field: PropTypes.string,
  tooltip: PropTypes.string,
};

const defaultProps = {
  field: '',
  tooltip: '',
};

const TableItem = ({ title, description, tooltip }) => (
  <tr>
    <TitleStyled>{title}</TitleStyled>
    <DescriptionStyled>
      <DescriptionTextStyled>{description}</DescriptionTextStyled>
      {tooltip && <TooltipIcon text={tooltip} />}
    </DescriptionStyled>
  </tr>
);

export const TableView = props => (
  <TableViewStyled>
    <tbody>
      <TableItem
        title="field"
        description={props.field}
        tooltip={props.tooltip}
      />
    </tbody>
  </TableViewStyled>
);

TableView.displayName = 'TableView';
TableView.propTypes = propTypes;
TableView.defaultProps = defaultProps;
