import EmberTether from 'ember-tether/components/ember-tether';
import { computed } from '@ember/object';

export default EmberTether.extend({
  tagName: 'ul',

  attributeBindings: ['role'],
  role: 'listbox',

  target: computed('attachTo', function() {
    return `#${this.attachTo}`;
  }),
  targetAttachment: 'bottom left',
  attachment: 'top left',


  'data-test-dropdown-list': true
});
