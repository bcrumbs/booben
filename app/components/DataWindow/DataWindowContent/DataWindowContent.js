'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';

import {
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../../BlockContent/BlockContent';

import {
  DataList,
  DataItem,
} from '../../DataList/DataList';

import { noop } from '../../../utils/misc';

export const DataWindowContent = props => {
  let type = null;
  if (props.type) {
    type = (
      <div className="data-window_type">
        {props.type}
      </div>
    );
  }

  let subtitle = null;
  if (props.subtitle) {
    subtitle = (
      <div className="data-window_subtitle">
        {props.subtitle}
      </div>
    );
  }

  let argsButton = null;
  if (props.argsButton) {
    argsButton = (
      <BlockContentBoxItem>
        <div className="data-window_heading-buttons">
          <Button
            text={props.argsButtonText}
            onPress={props.onSetArgumentsClick}
            narrow
          />
        </div>
      </BlockContentBoxItem>
    );
  }

  const contentHeading = (
    <BlockContentBoxHeading>
      {props.contentHeading}
    </BlockContentBoxHeading>
  );
  
  const items = props.list.map(item => (
    <DataItem key={item.id} {...item} />
  ));
  
  const content = (
    <BlockContentBoxItem>
      <DataList>
        {items}
      </DataList>
      
      {props.children}
    </BlockContentBoxItem>
  );

  let title = null;
  if (props.title) {
    title = (
      <BlockContentBoxItem>
        <div className="data-window_title-box">
          <div className="data-window_title-content">
            <div className="data-window_title">
              {props.title}
            </div>
            {type}
            {subtitle}
          </div>
        </div>
      </BlockContentBoxItem>
    );
  }
  
  let descriptionHeading = null,
    description = null;
  
  if (props.description) {
    descriptionHeading = (
      <BlockContentBoxHeading>
        Description
      </BlockContentBoxHeading>
    );
    
    description = (
      <BlockContentBoxItem>
        {props.description}
      </BlockContentBoxItem>
    );
  }

  return (
    <div className="data-window_content">
      <div className="data-window_content-heading">
        {title}
        {descriptionHeading}
        {description}
        {argsButton}
      </div>
      {contentHeading}
      {content}
    </div>
  );
};

DataWindowContent.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  contentHeading: PropTypes.string,
  argsButton: PropTypes.bool,
  argsButtonText: PropTypes.string,
  list: PropTypes.arrayOf(PropTypes.object),
  onSetArgumentsClick: PropTypes.func,
};

DataWindowContent.defaultProps = {
  title: '',
  type: '',
  subtitle: '',
  description: '',
  contentHeading: '',
  argsButton: false,
  argsButtonText: 'Set arguments',
  list: [],
  onSetArgumentsClick: noop,
};

DataWindowContent.displayName = 'DataWindowContent';

export * from './DataWindowContentGroup/DataWindowContentGroup';
