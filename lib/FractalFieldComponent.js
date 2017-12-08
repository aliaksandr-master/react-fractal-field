import PropTypes from 'prop-types';
import FractalComponent from './FractalComponent';



const FractalFieldComponent = class FractalFieldComponent extends FractalComponent {

  static propTypes = {
    ...FractalComponent.propTypes,
    name: PropTypes.string
  };

  static defaultProps = {
    name: null
  };

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      field: true,
      name: this.props.name,
      value: undefined
    };
  }

  constructor (...args) {
    super(...args);
  }

  onUpdate (...args) {
    super.onUpdate(...args);

    const { name } = args[0];

    if (this.props.name !== name) {
      this.mediator.rename(this.props.name);
    }
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params
    };
  }

};

export default FractalFieldComponent;
