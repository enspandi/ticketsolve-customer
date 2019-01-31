import Controller from '@ember/controller';
import EmberObject from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Controller.extend({
  ticketsolve: service(),

  save: task(function*() {
    yield timeout(250);
    if (this.customer.id) {
      yield this.ticketsolve.updateCustomer(this.customer);
    } else {
      let customer = yield this.ticketsolve.createCustomer(this.customer);
      this.set('selected', customer);
    }
    this.set('customer', null);
  }).drop(),

  actions: {
    create() {
      this.set('customer', EmberObject.create({
        firstName: '',
        lastName: ''
      }));
    },
    edit(customer) {
      this.set('customer', customer);
    },
    cancel() {
      this.set('customer', null);
    }
  }
});
