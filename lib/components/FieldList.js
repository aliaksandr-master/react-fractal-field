import React from 'react';
import PropTypes from 'prop-types';
import { TYPE } from '../utils/const';
import FieldComplex from './FieldComplex';


const FieldList = class FieldList extends FieldComplex {

  static propTypes = {
    ...FieldComplex.propTypes,
    value: PropTypes.array,
    initialValue: PropTypes.array
  };

  static defaultProps = {
    ...FieldComplex.defaultProps,
    type: TYPE.ARRAY
  };

  constructor (...args) {
    super(...args);

    this.listRemoveItems = this.listRemoveItems.bind(this);
    this.listAppendItems = this.listAppendItems.bind(this);
    this.listPrependItems = this.listPrependItems.bind(this);
  }

  calcParams () {
    const params = super.calcParams();

    return {
      ...params,
      removeItems: this.listRemoveItems,
      appendItems: this.listAppendItems,
      prependItems: this.listPrependItems,
      items: this.getState().value || []
    };
  }

  listRemoveItems (...indexes) {
    if (!indexes.length) {
      return;
    }

    const value = (this.getState().value || []).filter((_val, index) => !indexes.includes(index));

    this.triggerChange(value);
  }

  listAppendItems (...itemIndexes) {
    if (!itemIndexes.length) {
      return;
    }

    const value = this.getState().value || [];

    this.triggerChange([ ...value, ...itemIndexes ]);
  }

  listPrependItems (...items) {
    if (!items.length) {
      return;
    }

    const value = this.getState().value || [];

    this.triggerChange([ ...items, ...value ]);
  }
};


export default FieldList;
