/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import _forOwn from 'lodash.forown';
import { Button } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
  BlockContentBoxGroup,
  BlockContentNavigation,
  BlockBreadcrumbs,
} from '../../../components/BlockContent/BlockContent';

import {
  DataList,
  DataItem,
} from '../../../components/DataList/DataList';

import {
  DataWindowTitle,
  DataWindowHeadingButtons,
} from '../../../components/DataWindow/DataWindow';

import { returnArg } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  types: PropTypes.objectOf(PropTypes.object).isRequired,
  rootTypeName: PropTypes.string.isRequired,
  linkTargetComponentMeta: PropTypes.object.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
};

export class DataSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentTypeName: props.rootTypeName,
      currentPath: [],
    };
  }
  
  _getBreadcrumbsItems() {
    // TODO: Make items
    return [];
  }
  
  /**
   *
   * @param {DataObjectType} type
   * @return {ReactElement[]}
   * @private
   */
  _renderFields(type) {
    const ret = [];
  
    // TODO: Use target type to filter fields
    _forOwn(type.fields, (fieldName, field) => {
      ret.push(
        <DataItem
          key={fieldName}
          id={fieldName}
          title={fieldName}
          description={field.description}
          type={field.type}
        />,
      );
      
      if (field.connectionFields) {
        _forOwn(field.connectionFields, (connFieldName, connField) => {
          const fullName = `${fieldName}/${connFieldName}`;
          
          ret.push(
            <DataItem
              key={fullName}
              id={fullName}
              title={fullName}
              description={connField.description}
              type={connField.type}
            />,
          );
        });
      }
    });
    
    return ret;
  }
  
  render() {
    const { types, getLocalizedText } = this.props;
    const { currentTypeName } = this.state;
    
    /** @type {DataObjectType} */
    const currentType = types[currentTypeName];
    
    const breadCrumbsItems = this._getBreadcrumbsItems();
    const fieldsList = this._renderFields(currentType);
    const setArgumentsText = getLocalizedText('replace_me:Set Arguments');
    const descriptionText = getLocalizedText('replace_me:Description');
    
    return (
      <BlockContent>
        <BlockContentNavigation isBordered>
          <BlockBreadcrumbs mode="dark" items={breadCrumbsItems} />
        </BlockContentNavigation>
        
        <BlockContentBox isBordered flex>
          <BlockContentBoxGroup dim>
            <BlockContentBoxItem>
              <DataWindowTitle title={currentType.name} />
            </BlockContentBoxItem>
  
            <BlockContentBoxHeading>
              {descriptionText}
            </BlockContentBoxHeading>
            
            <BlockContentBoxItem>
              {currentType.description}
            </BlockContentBoxItem>
  
            <BlockContentBoxItem>
              <DataWindowHeadingButtons>
                <Button text={setArgumentsText} narrow />
              </DataWindowHeadingButtons>
            </BlockContentBoxItem>
          </BlockContentBoxGroup>
  
          <BlockContentBoxHeading>
            Content heading (WTF is this?)
          </BlockContentBoxHeading>
  
          <BlockContentBoxItem>
            <DataList>
              {fieldsList}
            </DataList>
          </BlockContentBoxItem>
        </BlockContentBox>
      </BlockContent>
    );
  }
}

DataSelection.propTypes = propTypes;
DataSelection.defaultProps = defaultProps;
DataSelection.displayName = 'DataSelection';
