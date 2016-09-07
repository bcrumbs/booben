/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';

import {
	App
} from '@reactackle/reactackle'

export class Test extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showText2: false
        };

        this._handleClick = this._handleClick.bind(this);
    }

    _handleClick() {
        this.setState({
            showText2: !this.state.showText2
        })
    }

    render() {
        return (
        	<App>
		        <span onClick={this._handleClick}>
                    {this.state.showText2 ? "Goodbye" : "Hello"}
                </span>
	        </App>
        );
    }
}
