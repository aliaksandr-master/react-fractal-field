import { TYPE } from '../utils/const';
import Field from './Field';



const FieldNumber = class FieldNumber extends Field {

  static propTypes = {
    ...Field.propTypes
  };

  static defaultProps = {
    ...Field.defaultProps,
    type: TYPE.NUMBER
  };

};


export default FieldNumber;
