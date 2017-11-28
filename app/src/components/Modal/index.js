import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode, createPortal } from 'react-dom';
import tabbable from 'tabbable';
import blockScroll from 'no-scroll';
import withEventListeners from './withEventListeners';
import { toClassComponent } from '../../utils/react';

const propTypes = {
  allowOutsideInteractions: PropTypes.bool,
  allowOutsideScroll: PropTypes.bool,
  closeOnKeysPressed: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  retrieveFocusAfterClose: PropTypes.bool,
  onCloseAttempt: PropTypes.func,
  toggleEventListener: PropTypes.func.isRequired,
  cleanEventListeners: PropTypes.func.isRequired,
  ariaTitle: PropTypes.string,
  disableFocus: PropTypes.bool,
  render: PropTypes.func.isRequired,
};

const defaultProps = {
  closeOnKeysPressed: ['Escape'],
  retrieveFocusAfterClose: false,
  allowOutsideInteractions: false,
  allowOutsideScroll: false,
  onCloseAttempt: () => {},
  ariaTitle: 'Modal',
  disableFocus: false,
};

class Modal extends Component {
  constructor(props) {
    super(props);

    this.ModalComponent = toClassComponent(this.props.render);

    this.onOutsideClick = this.onOutsideClick.bind(this);
    this.tryFocusNode = this.tryFocusNode.bind(this);
    this.tryRetrieveFocus = this.tryRetrieveFocus.bind(this);
    this.updateTabbableNodes = this.updateTabbableNodes.bind(this);
    this.handleTabKey = this.handleTabKey.bind(this);
    this.handleKeys = this.handleKeys.bind(this);
    this.modalDidUpdate = this.modalDidUpdate.bind(this);
    this.toggleOutsideListener = this.toggleOutsideListener.bind(this);
    this.toggleTabListener = this.toggleTabListener.bind(this);
    this.toggleKeysListener = this.toggleKeysListener.bind(this);
    this.setAriaAttributesToModal = this.setAriaAttributesToModal.bind(this);
  }

  componentWillMount() {
    this.savedFocusNode = document.activeElement;
  }

  componentDidMount() {
    const {
      allowOutsideInteractions,
      closeOnKeysPressed,
      allowOutsideScroll,
    } = this.props;

    document.body.setAttribute('aria-hidden', 'true');

    if (!allowOutsideScroll) {
      blockScroll.on();
    }

    if (!allowOutsideInteractions) {
      this.toggleOutsideListener();
      this.toggleTabListener();
    }

    if (typeof closeOnKeysPressed !== 'boolean' && closeOnKeysPressed) {
      this.toggleKeysListener();
    }
  }

  componentWillReceiveProps({ allowOutsideInteractions }) {
    if (allowOutsideInteractions !== this.props.allowOutsideInteractions) {
      this.toggleOutsideListener();
    }
  }

  componentWillUnmount() {
    document.body.setAttribute('aria-hidden', 'false');
    this.props.cleanEventListeners();
    if (this.props.retrieveFocusAfterClose) this.tryRetrieveFocus();
    blockScroll.off();
  }

  onOutsideClick(event) {
    if (this.modalElement && this.modalElement.contains(event.target)) return;
    this.props.onCloseAttempt();
  }

  setAriaAttributesToModal(node) {
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-label', this.props.ariaTitle);
  }

  tryFocusNode(node) {
    if (!node || !node.focus) return;
    if (node === document.activeElement) return;

    node.focus();
  }

  tryRetrieveFocus() {
    this.tryFocusNode(this.savedFocusNode);
  }

  updateTabbableNodes() {
    const tabbableNodes = tabbable(this.modalElement);
    this.tabbableNodes = tabbableNodes.length ? tabbableNodes : null;
  }

  handleTabKey(e) {
    if (e.key === 'Tab' || e.keyCode === 9) {
      this.updateTabbableNodes();

      e.preventDefault();
      if (this.props.disableFocus) return;
      if (this.tabbableNodes < 2) return;
      const currentFocusIndex = this.tabbableNodes.indexOf(e.target);

      if (e.target === this.lastTabbableNode) {
        this.tryFocusNode(this.firstTabbableNode);
      }

      this.tryFocusNode(this.tabbableNodes[currentFocusIndex + 1]);
    }
  }

  handleKeys(e) {
    const { closeOnKeysPressed } = this.props;
    if (typeof closeOnKeysPressed === 'boolean' && !closeOnKeysPressed) return;
    if (Array.isArray(closeOnKeysPressed)) {
      if (
        closeOnKeysPressed.filter(
          key => key.toLowerCase() === e.key.toLowerCase(),
        ).length
      ) {
        this.props.onCloseAttempt();
      }
    }
  }

  get firstTabbableNode() {
    return this.tabbableNodes[0];
  }

  get lastTabbableNode() {
    return this.tabbableNodes[this.tabbableNodes.length - 1];
  }

  modalDidUpdate(ref) {
    if (ref) {
      this.modalElement = findDOMNode(ref);
      this.setAriaAttributesToModal(this.modalElement);
      this.updateTabbableNodes();

      // TODO: add props to focus specific element
      this.tryFocusNode(this.tabbableNodes[0]);
    }
  }

  toggleOutsideListener() {
    this.props.toggleEventListener({
      target: window,
      event: 'click',
      cb: this.onOutsideClick,
      capture: true,
    });
  }

  toggleTabListener() {
    this.props.toggleEventListener({
      target: window,
      event: 'keydown',
      cb: this.handleTabKey,
      capture: true,
    });
  }

  toggleKeysListener() {
    this.props.toggleEventListener({
      target: window,
      event: 'keydown',
      cb: this.handleKeys,
      capture: true,
    });
  }

  render() {
    const modalElement = <this.ModalComponent ref={this.modalDidUpdate} />;

    return createPortal(modalElement, document.body);
  }
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;

export default withEventListeners(Modal);

