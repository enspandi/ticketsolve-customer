import Component from '@ember/component';

export default Component.extend({
  onCreate: () => {},
  onEdit: () => {},

  actions: {
    remove() {
      this.set('customer', null);
    },
    select(customer) {
      this.set('customer', customer);
    }
  }
});
