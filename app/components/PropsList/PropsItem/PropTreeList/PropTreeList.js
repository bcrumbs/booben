'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

import { Button } from '@reactackle/reactackle';
import { noop } from '../../../../utils/misc';

export class PropTreeList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isTitleDialogVisible: false,
            name: ''
        };

        this._handleAddButtonPress = this._handleAddButtonPress.bind(this);
        this._handleNameChange = this._handleNameChange.bind(this);
        this._handleSaveButtonPress = this._handleSaveButtonPress.bind(this);
        this._handleCancelButtonPress = this._handleCancelButtonPress.bind(this);
    }

    _handleAddButtonPress() {
        if (this.props.askNameOnAdd) {
            this.setState({
                isTitleDialogVisible: true,
                name: ''
            })
        }
        else {
            this.props.onAdd();
        }
    }

    _handleNameChange(newName) {
        this.setState({
            name: newName
        });
    }

    _handleSaveButtonPress() {
        this.setState({
            isTitleDialogVisible: false
        });

        this.props.onAdd(this.state.name);
    }

    _handleCancelButtonPress() {
        this.setState({
            isTitleDialogVisible: false
        });
    }

    render() {
        let addButton = null;
        if (this.props.addButton && !this.state.isTitleDialogVisible) {
            addButton = (
                <div className="prop-tree-item-action-row">
                    <Button
                        text={this.props.addButtonText}
                        icon="plus"
                        size="small"
                        narrow
                        onPress={this._handleAddButtonPress}
                    />
                </div>
            );
        }

        let titleDialog = null;
        if (this.state.isTitleDialogVisible) {
            titleDialog = (
                <div className='prop-tree_field-new'>
                    <div className='prop-tree_field-new_row field-new_title'>
                        {this.props.addDialogTitleText}
                    </div>

                    <div className='prop-tree_field-new_row'>
                        <Input
                            label={this.props.addDialogInputLabelText}
                            value={this.state.name}
                            onChange={this._handleNameChange}
                            dense
                        />
                    </div>

                    <div className='prop-tree_field-new_row field-new_buttons'>
                        <Button
                            text={this.props.addDialogSaveButtonText}
                            disabled={!this.state.name}
                            narrow
                        />

                        <Button
                            text={this.props.addDialogCancelButtonText}
                            narrow
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className='prop-tree_list'>
                {this.props.children}
                {addButton}
                {titleDialog}
            </div>
        );
    }
}

PropTreeList.propTypes = {
    addButton: PropTypes.bool,
    askNameOnAdd: PropTypes.bool,
    addButtonText: PropTypes.string,
    addDialogTitleText: PropTypes.string,
    addDialogInputLabelText: PropTypes.string,
    addDialogSaveButtonText: PropTypes.string,
    addDialogCancelButtonText: PropTypes.string,

    onAdd: PropTypes.func
};

PropTreeList.defaultProps = {
    addButton: false,
    askNameOnAdd: false,
    addButtonText: '',
    addDialogTitleText: '',
    addDialogInputLabelText: '',
    addDialogSaveButtonText: '',
    addDialogCancelButtonText: '',

    onAdd: noop
};

PropTreeList.displayName = 'PropTreeList';
