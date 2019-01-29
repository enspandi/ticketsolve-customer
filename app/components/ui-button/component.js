import Component from '@ember/component';

export default Component.extend({
  tagName: '',

  type: 'button',

  actions: {
    click(e) {
      if (this.onClick) {
        e.preventDefault();
        this.onClick();
      }
    }
  }
});
