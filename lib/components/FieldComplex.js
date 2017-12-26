import { TYPE } from '../utils/const';
import FieldComponent from './FieldComponent';



const FieldComplex = class FieldComplex extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes
  };

  static defaultProps = {
    ...FieldComponent.defaultProps
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      simple: false
    };
  }

};


export default FieldComplex;
