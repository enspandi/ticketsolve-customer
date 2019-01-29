import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  ticketsolve: service(),

  isOpen: false,

  onSelect: () => {},
  onCreate: () => {},

  debounceSearch: task(function*(keyword) {
    this.setProperties({ customers: null, keyword: null });
    yield timeout(350);
    let customers = yield this.search.perform(keyword);
    this.setProperties({ customers, keyword });
  }).restartable(),

  search: task(function*(keyword) {
    return yield this.ticketsolve.queryCustomers(keyword);
  }),

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
    select(customer) {
      this.set('isOpen', false);
      this.onSelect(customer);
    },
    create() {
      this.set('isOpen', false);
      this.onCreate();
    }
  }
});
