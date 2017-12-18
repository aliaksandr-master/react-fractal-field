import { Component } from 'react';
import PropTypes from 'prop-types';



export default class KeyComponent extends Component {

  static propTypes = {
    children: PropTypes.func
  };

  render () {
    return this.props.children();
  }
}
