/**
 * @author Dmitriy Bizyaev
 */

import { Record, List } from 'immutable';
import { arrayToObject, returnArg, unflatten } from '../../utils/misc';

const DEFAULT_HISTORY_LENGTH = 100;

export default (
  recordInit,
  historyProps,
  { historyLength = DEFAULT_HISTORY_LENGTH } = {},
) => {
  const RecordClass = Record({
    ...recordInit,
    _history: List(),
    _historyTop: null,
    _historyPointer: 0,
  });
  
  return class extends RecordClass {
    _extractHistoryEntry() {
      return arrayToObject(
        historyProps,
        returnArg,
        key => this.getIn(key.split('.')),
      );
    }
    
    _applyHistoryEntry(historyEntry) {
      let record = this;

      historyProps.forEach(prop => {
        const path = prop.split('.');
        const value = prop.split('.')
          .reduce((previous, current) =>
            previous[current], unflatten(historyEntry));
        record = record.setIn(path, value);
      });
      
      return record;
    }
  
    pushHistoryEntry() {
      let nextHistory = this._history
        .setSize(this._history.size - this._historyPointer)
        .push(this._extractHistoryEntry());
    
      if (nextHistory.size > historyLength) {
        nextHistory = nextHistory.shift();
      }
    
      return this.merge({
        _history: nextHistory,
        _historyTop: null,
        _historyPointer: 0,
      });
    }

    canMoveBack() {
      return this._history.size - this._historyPointer > 0;
    }

    canMoveForward() {
      return this._historyPointer > 0;
    }
  
    moveBack() {
      let record = this;
      
      if (!this.canMoveBack()) {
        return record;
      }
    
      if (record._historyPointer === 0) {
        record = record.set('_historyTop', record._extractHistoryEntry());
      }
    
      const historyEntry = record._history
        .get(record._history.size - record._historyPointer - 1);
    
      return record
        ._applyHistoryEntry(historyEntry)
        .set('_historyPointer', record._historyPointer + 1);
    }
  
    moveForward() {
      if (!this.canMoveForward()) {
        return this;
      }
    
      if (this._historyPointer === 1) {
        return this
          ._applyHistoryEntry(this._historyTop)
          .merge({
            _historyPointer: 0,
            _historyTop: null,
          });
      }
    
      const historyEntry = this._history
        .get(this._history.size - this._historyPointer + 1);
    
      return this
        ._applyHistoryEntry(historyEntry)
        .set('_historyPointer', this._historyPointer - 1);
    }
  
    resetHistory() {
      return this.merge({
        _history: List(),
        _historyPointer: 0,
        _historyTop: null,
      });
    }
  };
};
