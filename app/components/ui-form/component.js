import Component from '@ember/component';
import BufferedProxy from 'ember-buffered-proxy/proxy';
import { getOwner } from '@ember/application';

export default Component.extend({
  tagName: 'form',

  validations: null, // Mixin

  didReceiveAttrs() {
    if (this.model) {
      let buffer = this._createBuffer();
      this.set('buffer', buffer);
    }
  },

  _createBuffer() {
    let bufferClass = BufferedProxy;
    if (this.validations) {
      bufferClass = bufferClass.extend(this.validations);
    }
    return bufferClass.create(
      getOwner(this).ownerInjection(),
      { content: this.model }
    );
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
