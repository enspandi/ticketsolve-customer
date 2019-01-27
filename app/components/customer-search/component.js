import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isNone } from '@ember/utils';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ENTER = 13;

export default Component.extend({
  ticketsolve: service(),

  localClassNames: 'customer-search',

  isOpen: false,

  onSelect: () => {},

  debounceSearch: task(function*(keyword) {
    this.setProperties({ customers: null, keyword: null });
    yield timeout(350);
    let customers = yield this.search.perform(keyword);
    this.setProperties({ customers, keyword, focusIdx: null });
  }).restartable(),

  search: task(function*(keyword) {
    return yield this.ticketsolve.queryCustomers(keyword);
  }),


  keyDown(e) {
    if (e.keyCode === KEY_DOWN) {
      this.highlightNext();
    } else if (e.keyCode === KEY_UP) {
      this.highlightPrev();
    } else if (e.keyCode === KEY_ENTER) {
      this.send('select', this.highlighted);
    }
  },

  focusIdx: null,
  highlighted: computed('focusIdx', 'customers.length', function() {
    return !isNone(this.focusIdx) && this.customers[this.focusIdx];
  }),
  highlight(customer) {
    if (!isNone(this.customers)) {
      this.set('focusIdx', this.customers.indexOf(customer));
    }
  },
  highlightNext() {
    if (!isNone(this.customers)) {
      this.set('focusIdx', this._highlightByOffset(1));
    }
  },
  highlightPrev() {
    if (!isNone(this.customers)) {
      this.set('focusIdx', this._highlightByOffset(-1));
    }
  },
  _highlightByOffset(offset) {
    if (isNone(this.focusIdx)) {
      return 0;
    }
    let focusIdx = this.focusIdx + offset;
    let maxIdx = this.customers.length - 1;
    if (focusIdx < 0) {
      focusIdx = maxIdx;
    } else if (focusIdx > maxIdx) {
      focusIdx = 0;
    }
    return focusIdx;
  },

  actions: {
    open() {
      this.set('isOpen', true);
    },
    close(e) {
      let isClickOutside = !this.element.contains(e.relatedTarget);
      if (isClickOutside) {
        this.set('isOpen', false);
      }
    },
    highlight(customer) {
      this.highlight(customer);
    },
    select(customer) {
      this.set('isOpen', false);
      this.onSelect(customer);
    }
  }
});
