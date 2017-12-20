import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import FieldComplex from './FieldComplex';


const FieldSet = class FieldSet extends FieldComplex {

  static propTypes = {
    ...FieldComplex.propTypes,
    value: PropTypes.object,
    initialValue: PropTypes.object
  };

  static defaultProps = {
    ...FieldComplex.defaultProps,
    initialValue: {}
  };

  getValueType () {
    return TYPE.OBJECT;
  }

};


export default FieldSet;
