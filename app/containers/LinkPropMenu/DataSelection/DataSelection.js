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

import { isCompatibleType } from '../../../../shared/types';
import { getJssyTypeOfField } from '../../../utils/schema';
import { returnArg, objectSome } from '../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  schema: PropTypes.object.isRequired,
  rootTypeName: PropTypes.string.isRequired,
  linkTargetComponentMeta: PropTypes.object.isRequired,
  linkTargetPropTypedef: PropTypes.object.isRequired,
  getLocalizedText: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
};

const fieldHasCompatibleSubFields = (
  fieldJssyTypedef,
  linkTargetPropTypedef,
  linkTargetComponentMeta,
) =>
  fieldJssyTypedef.type === 'shape' &&
    
  objectSome(
    fieldJssyTypedef.fields,
    
    fieldTypedef =>
    isCompatibleType(
        fieldTypedef,
        linkTargetPropTypedef,
        {},
        linkTargetComponentMeta.types,
      ) ||
      fieldHasCompatibleSubFields(
        fieldTypedef,
        linkTargetPropTypedef,
        linkTargetComponentMeta,
      ),
  );

const getFieldCompatibility = (
  jssyType,
  linkTargetPropTypedef,
  linkTargetComponentMeta,
) => {
  const isCompatible = isCompatibleType(
    jssyType,
    linkTargetPropTypedef,
    {},
    linkTargetComponentMeta.types,
  );
  
  const hasCompatibleSubFields = fieldHasCompatibleSubFields(
    jssyType,
    linkTargetPropTypedef,
    linkTargetComponentMeta,
  );
  
  return { isCompatible, hasCompatibleSubFields };
};

export class DataSelection extends PureComponent {
  constructor(props) {
    super(props);
    
    this.state = {
      currentTypeName: props.rootTypeName,
      currentPath: [],
      selectedField: null,
    };
    
    this._handleFieldJumpInto = this._handleFieldJumpInto.bind(this);
    this._handleFieldSelect = this._handleFieldSelect.bind(this);
  }
  
  _getBreadcrumbsItems() {
    // TODO: Make items
    return [];
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleFieldJumpInto({ id: fieldName }) {
    const nextTypeName = this.props.schema
      .types[this.state.currentTypeName]
      .fields[fieldName]
      .type;
    
    this.setState({
      currentPath: this.state.currentPath.concat(fieldName),
      currentTypeName: nextTypeName,
    });
  }
  
  /**
   *
   * @param {string} fieldName
   * @private
   */
  _handleFieldSelect({ id: fieldName }) {
    this.setState({
      selectedField: fieldName,
    });
  }
  
  /**
   *
   * @param {DataObjectType} type
   * @return {ReactElement[]}
   * @private
   */
  _renderFields(type) {
    const {
      schema,
      linkTargetPropTypedef,
      linkTargetComponentMeta,
    } = this.props;
    
    const ret = [];
    
    _forOwn(type.fields, (field, fieldName) => {
      const jssyType = getJssyTypeOfField(field, schema);
      
      const { isCompatible, hasCompatibleSubFields } = getFieldCompatibility(
        jssyType,
        linkTargetPropTypedef,
        linkTargetComponentMeta,
      );
      
      if (!isCompatible && !hasCompatibleSubFields) return;
      
      ret.push(
        <DataItem
          key={fieldName}
          id={fieldName}
          title={fieldName}
          description={field.description}
          type={field.type}
          actionType={isCompatible ? 'select' : 'jump'}
          connection={hasCompatibleSubFields}
          onJumpIntoClick={this._handleFieldJumpInto}
          onSelect={this._handleFieldSelect}
        />,
      );
      
      if (field.connectionFields) {
        _forOwn(field.connectionFields, (connField, connFieldName) => {
          const fullName = `${fieldName}/${connFieldName}`;
          const connFieldJssyType = getJssyTypeOfField(connField, schema);
  
          const {
            isCompatible,
            hasCompatibleSubFields,
          } = getFieldCompatibility(
            connFieldJssyType,
            linkTargetPropTypedef,
            linkTargetComponentMeta,
          );
  
          if (!isCompatible && !hasCompatibleSubFields) return;
          
          ret.push(
            <DataItem
              key={fullName}
              id={fullName}
              title={fullName}
              description={connField.description}
              type={connField.type}
              actionType={isCompatible ? 'select' : 'jump'}
              connection={hasCompatibleSubFields}
              onJumpIntoClick={this._handleFieldJumpInto}
              onSelect={this._handleFieldSelect}
            />,
          );
        });
      }
    });
    
    return ret;
  }
  
  render() {
    const { schema: { types }, getLocalizedText } = this.props;
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
