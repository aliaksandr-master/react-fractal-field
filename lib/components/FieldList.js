import React from 'react';
import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import FieldComponent from './FieldComponent';


const FieldList = class FieldList extends FieldComponent {

  static propTypes = {
    ...FieldComponent.propTypes,
    value: PropTypes.array,
    initialValue: PropTypes.array
  };

  static defaultProps = {
    ...FieldComponent.defaultProps,
    initialValue: [],
    type: TYPE.ARRAY
  };

  constructor (...args) {
    super(...args);

    this.listMapItems = this.listMapItems.bind(this);
    this.listRemoveItems = this.listRemoveItems.bind(this);
    this.listAppendItems = this.listAppendItems.bind(this);
    this.listPrependItems = this.listPrependItems.bind(this);

    this.superRenderInner = super.renderInner.bind(this);
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params,
      items: {
        length: this.getState().value.length,
        map: this.listMapItems,
        remove: this.listRemoveItems,
        append: this.listAppendItems,
        prepend: this.listPrependItems
      }
    };
  }

  listMapItems (mapFunc, filterFunc) {
    let items = this.getState().value;

    if (filterFunc) {
      items = items.filter(filterFunc);
    }

    return items.map(mapFunc);
  }

  listRemoveItems (...indexes) {
    if (!indexes.length) {
      return;
    }

    const value = this.getState().value.filter((_val, index) => {
      return !indexes.includes(index);
    });

    this.triggerChange(value);
  }

  listAppendItems (...items) {
    if (!items.length) {
      return;
    }

    items = [ ...this.getState().value, ...items ];

    this.triggerChange(items);
  }

  listPrependItems (...items) {
    if (!items.length) {
      return;
    }

    this.triggerChange([ ...items, ...this.getState().value ]);
  }
};


export default FieldList;
