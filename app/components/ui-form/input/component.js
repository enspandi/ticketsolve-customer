import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  actions: {
    setValue(value) {
      this.model.set(this.field, value);
    }
  }
});
