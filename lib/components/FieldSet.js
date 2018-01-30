import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import FieldComponent from './FieldComponent';



const FieldSet = class FieldSet extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes,
    value: PropTypes.object,
    initialValue: PropTypes.object
  };

  static defaultProps = {
    ...FieldComponent.defaultProps,
    initialValue: {}
  };

  getValueType () {
    return TYPE.OBJECT;
  }

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      simple: false
    };
  }

};


export default FieldSet;
