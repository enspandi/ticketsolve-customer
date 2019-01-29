import Component from '@ember/component';
import BufferedProxy from 'ember-buffered-proxy/proxy';

export default Component.extend({
  tagName: 'form',

  didReceiveAttrs() {
    if (this.model) {
      this.set('buffer', BufferedProxy.create({ content: this.model }));
    }
  },

  submit(e) {
    e.preventDefault();
    if (this.buffer) {
      // Obviously run some validations
      this.buffer.applyChanges();
    }
    this.submitTask.perform();
  }
});
