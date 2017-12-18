import { TYPE } from '../utils/const';
import Field from './Field';



const FieldBoolean = class FieldBoolean extends Field {

  static defaultProps = {
    ...Field.defaultProps,
    type: TYPE.BOOLEAN
  };

};


export default FieldBoolean;
