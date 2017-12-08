import PropTypes from 'prop-types';
import FractalFieldComponent from './FractalFieldComponent';



const FractalFieldSet = class FractalFieldSet extends FractalFieldComponent {

  static propTypes = {
    ...FractalFieldComponent.propTypes
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      value: {}
    };
  }

};

export default FractalFieldSet;
