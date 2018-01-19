import PropTypes from 'prop-types';
import patchComponent from '../../../hocs/patchComponent';

const propTypes = {
  text: PropTypes.string,
};

const defaultProps = {
  text: '',
};

const _Text = props => props.text;

_Text.propTypes = propTypes;
_Text.defaultProps = defaultProps;
_Text.displayName = 'Text';

export const Text = patchComponent(_Text);
