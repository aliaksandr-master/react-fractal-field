import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import Field from './Field';



const FieldNumber = class FieldNumber extends Field {

  static propTypes = {
    ...Field.propTypes,
    value: PropTypes.number,
    initialValue: PropTypes.number
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getValueType () {
    return TYPE.NUMBER;
  }

};


export default FieldNumber;
