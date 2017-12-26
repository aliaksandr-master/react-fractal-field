import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import Field from './Field';



const FieldBoolean = class FieldBoolean extends Field {

  static propTypes = {
    ...Field.propTypes,
    value: PropTypes.bool,
    initialValue: PropTypes.bool
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getValueType () {
    return TYPE.BOOLEAN;
  }

};


export default FieldBoolean;
