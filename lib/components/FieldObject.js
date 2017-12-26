import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import Field from './Field';



const FieldObject = class FieldObject extends Field {

  static propTypes = {
    ...Field.propTypes,
    value: PropTypes.object,
    initialValue: PropTypes.object
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getValueType () {
    return TYPE.OBJECT;
  }
};


export default FieldObject;
