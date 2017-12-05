import React, { Component } from 'react';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';



let counter = 0;


export default class ConnectedComponent extends Component {
  constructor (...args) {
    super(...args);

    this.componentID = `component${counter++}`;

    this._state = this.state = this.reducer(undefined, { type: 'INIT' });

    this._triggerSetState = debounce(this._triggerSetState, 0);

    this._unmounted = false;
  }

  mapDispatch (map) {
    const that = this;

    forEach(map, (creator, method) => {
      that[method] = (...args) => {
        const prevState = this._state;

        this._state = this.reducer(prevState, creator(...args));

        if (this._state !== prevState) {
          this._triggerSetState();
        }
      };
    });
  }

  getState () {
    return this._state;
  }

  componentWillUnmount () {
    this._unmounted = true;
  }

  reducer (state, action) {
    return state;
  }

  _triggerSetState () {
    if (this._unmounted) {
      return;
    }
    this.setState(() => this._state); // eslint-disable-line react/no-set-state
  }
}
