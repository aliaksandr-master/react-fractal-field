import React from 'react';
import PropTypes from 'prop-types';
import FractalFieldComponent from './FractalComponent';
import KeyComponent from './KeyComponent';



const FractalFieldList = class FractalFieldList extends FractalFieldComponent {

  static propTypes = {
    ...FractalFieldComponent.propTypes,
    idAttribute: PropTypes.string
  };

  constructor (...args) {
    super(...args);

    this.mapItems = this.mapItems.bind(this);
    this.superRender = super.render.bind(this);
    this.removeItems = this.removeItems.bind(this);
    this.appendItems = this.appendItems.bind(this);
    this.prependItems = this.prependItems.bind(this);
    this.triggerChange = this.triggerChange.bind(this);

    this._version = 0;
  }

  getInitialParams () {
    return {
      ...super.getInitialParams(),
      array: true,
      value: []
    };
  }

  mapItems (mapFunc, filterFunc) {
    let items = this.getState().value;

    console.log(items, this.getState(), this.componentID);

    if (filterFunc) {
      items = items.filter(filterFunc);
    }

    return items.map(mapFunc);
  }

  removeItems (...indexes) {
    if (!indexes.length) {
      return;
    }

    const value = this.getState().value.filter((index) => !indexes.includes(index));

    this.onChange(value);
  }

  appendItems (...items) {
    this.onChange([ ...this.getState().value, ...items ]);
  }

  prependItems (...items) {
    this.onChange([ ...items, ...this.getState().value ]);
  }

  triggerChange (...args) {
    this._version++;

    return this.onChange(...args);
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params,
      items: {
        map: this.mapItems,
        remove: this.removeItems,
        append: this.appendItems,
        prepend: this.prependItems
      },
      triggerChange: this.triggerChange
    };
  }

  render () {
    return (
      <KeyComponent key={this._version}>{this.superRender}</KeyComponent>
    );
  }

};

export default FractalFieldList;
