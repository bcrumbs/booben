import React, { PropTypes } from 'react';
import './DataList.scss';

import { DataItem } from './DataItem/DataItem';

export const DataList = props => {
  const className = 'data-list';

  const list = props.data.map((item, idx) => (
    <DataItem
      key={idx}
      {...item}
    />
    ));

  return (
    <div className={className}>
      { list }
      { props.children }
    </div>
  );
};

DataList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
};

DataList.defaultProps = {
  data: [],
};

DataList.displayName = 'DataList';

export * from './DataItem/DataItem';
