import React from 'react';
import FieldComponent from './FieldComponent';
import { TYPE } from './const';
import KeyComponent from './KeyComponent';


const FieldList = class FieldList extends FieldComponent {

  getType () {
    return TYPE.ARRAY;
  }

  getInitialParams () {
    const params = super.getInitialParams();

    return {
      ...params,
      value: []
    };
  }

  constructor (...args) {
    super(...args);

    this._listVersion = 0;
    this._prevListVersion = 0;

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
        map: this.listMapItems,
        remove: this.listRemoveItems,
        append: this.listAppendItems,
        prepend: this.listPrependItems
      }
    };
  }

  onChange (value) {
    this._listVersion++;

    super.onChange(value);
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

    const value = this.getState().value.filter((index) => !indexes.includes(index));

    this.onChange(value);
  }

  listAppendItems (...items) {
    this.onChange([ ...this.getState().value, ...items ]);
  }

  listPrependItems (...items) {
    this.onChange([ ...items, ...this.getState().value ]);
  }

  renderInner () {
    return <KeyComponent key={this._listVersion}>{this.superRenderInner}</KeyComponent>
  }
};


export default FieldList;
