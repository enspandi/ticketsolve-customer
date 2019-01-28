import Component from '@ember/component';

export default Component.extend({
  actions: {
    create() {

    },
    edit() {

    },
    remove() {
      this.set('customer', null);
    },
    select(customer) {
      this.set('customer', customer);
    }
  }
});
