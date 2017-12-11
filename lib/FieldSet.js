import FieldComponent from './FieldComponent';
import { TYPE } from './const';


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
