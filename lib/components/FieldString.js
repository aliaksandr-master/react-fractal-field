import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import Field from './Field';



const FieldString = class FieldString extends Field {

  static propTypes = {
    ...Field.propTypes,
    value: PropTypes.string,
    initialValue: PropTypes.string
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getValueType () {
    return TYPE.STRING;
  }

};


export default FieldString;
