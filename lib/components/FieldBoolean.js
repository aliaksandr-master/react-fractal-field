import { TYPE } from '../utils/const';
import Field from './Field';
import FieldComponent from './FieldComponent';



const FieldBoolean = class FieldBoolean extends Field {

  static propTypes = {
    ...Field.propTypes
  };

  static defaultProps = {
    ...Field.defaultProps,
    type: TYPE.BOOLEAN
  };

};


export default FieldBoolean;
