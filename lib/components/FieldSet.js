import { TYPE } from '../utils/const';
import FieldComponent from './FieldComponent';


const FieldSet = class FieldSet extends FieldComponent {

  getType () {
    return TYPE.OBJECT;
  }

  getInitialParams () {
    const params = super.getInitialParams();

    return {
      ...params,
      value: {}
    };
  }

};


export default FieldSet;
