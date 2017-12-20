import { TYPE } from '../utils/const';
import Field from './Field';
import FieldComponent from './FieldComponent';



const FieldComplex = class FieldComplex extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes
  };

  static defaultProps = {
    ...Field.defaultProps,
    type: TYPE.COMPLEX
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      simple: false,
      complex: true
    };
  }

};


export default FieldComplex;
