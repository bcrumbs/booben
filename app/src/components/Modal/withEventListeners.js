import React, { Component } from 'react';
import hash from 'object-hash';

export default WrappedComponent => {
  class WithEventListeners extends Component {
    constructor(props) {
      super(props);

      this.state = {
        eventListeners: {},
      };
      this.listeners = 0;

      this._toggleEventListener = this._toggleEventListener.bind(this);
      this._cleanEventListeners = this._cleanEventListeners.bind(this);
    }

    _toggleEventListener(newListener) {
      const stringified = JSON.stringify({
        ...newListener,
        target: '',
        cb: String(newListener.cb),
      });
      const listenerName = hash(stringified);
      const {
        [listenerName]: existedListener,
        ...eventListeners
      } = this.state.eventListeners;
      if (existedListener) {
        existedListener.target.removeEventListener(
          existedListener.event,
          existedListener.cb,
          existedListener.capture,
        );
        this.setState({ eventListeners });
      } else {
        const { target, event, cb, capture } = newListener;
        target.addEventListener(event, cb, capture);
        this.setState(({ eventListeners }) => ({
          eventListeners: {
            ...eventListeners,
            [listenerName]: newListener,
          },
        }));
      }
    }

    _cleanEventListeners() {
      const listeners = this.state.eventListeners;
      Object.values(listeners).forEach(listener => {
        this._toggleEventListener(listener);
      });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          toggleEventListener={this._toggleEventListener}
          cleanEventListeners={this._cleanEventListeners}
        />
      );
    }
  }

  return WithEventListeners;
};
