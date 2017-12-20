import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import Field from './Field';
import FieldComponent from './FieldComponent';



const FieldArray = class FieldArray extends Field {

  static propTypes = {
    ...Field.propTypes,
    value: PropTypes.array,
    initialValue: PropTypes.array
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getValueType () {
    return TYPE.ARRAY;
  }

};


export default FieldArray;
