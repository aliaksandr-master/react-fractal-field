import { TYPE } from '../utils/const';
import Field from './Field';
import FieldComponent from './FieldComponent';



const FieldComplex = class FieldComplex extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes
  };

  static defaultProps = {
    ...Field.defaultProps
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      simple: false
    };
  }

};


export default FieldComplex;
