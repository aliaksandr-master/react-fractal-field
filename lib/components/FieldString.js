import { TYPE } from '../utils/const';
import Field from './Field';



const FieldString = class FieldString extends Field {

  static propTypes = {
    ...Field.propTypes
  };

  static defaultProps = {
    ...Field.defaultProps,
    type: TYPE.STRING
  };

};


export default FieldString;
