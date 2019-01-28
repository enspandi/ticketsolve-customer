import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    create() {

    },
    edit() {

    },
    clear() {
      this.set('customer', null);
    },
    select(customer) {
      this.set('customer', customer);
    }
  }
});
