/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { toClassComponent } from '../utils/react';

export default WrappedComponent => {
  const stateStore = new Map();
  
  const ret = class extends toClassComponent(WrappedComponent) {
    constructor(props, context) {
      super(props, context);
      if (props.stateKey && stateStore.has(props.stateKey)) {
        this.state = stateStore.get(props.stateKey);
        this.clearState = false;
      }
    }
    
    componentWillReceiveProps(...args) {
      if (super.componentWillReceiveProps)
        super.componentWillReceiveProps(...args);
      
      const nextProps = args[0];
      
      if (nextProps.stateKey !== this.props.stateKey) {
        throw new Error(
          'withPermanentState: you must not change the stateKey prop\'s value',
        );
      }
    }
    
    componentWillUnmount() {
      if (super.componentWillUnmount) super.componentWillUnmount();
      
      if (this.props.stateKey) {
        if (this.clearState) stateStore.delete(this.props.stateKey);
        else stateStore.set(this.props.stateKey, this.state);
      }
    }
  };
  
  ret.propTypes = WrappedComponent.propTypes;
  ret.contextTypes = WrappedComponent.contextTypes;
  ret.defaultProps = WrappedComponent.defaultProps;
  ret.displayName = `withPermanentState(${WrappedComponent.displayName})`;
  
  return ret;
};
