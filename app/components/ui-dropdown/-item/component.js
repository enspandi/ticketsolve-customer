import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  tagName: 'li',

  classNameBindings: ['isActive'],
  attributeBindings: ['role', 'ariaCurrent', 'tabindex'],
  role: 'option',
  arriaCurrent: reads('isActive'),
  tabindex: '-1',

  'data-test-dropdown-item': true,
  'data-test-is-active': reads('isActive'),

  onMouseEnter: () => {},
  onMouseLeave: () => {},
  onClick: () => {},

  mouseEnter(e) {
    this.onMouseEnter(e);
  },
  mouseLeave(e) {
    this.onMouseLeave(e);
  },
  click(e) {
    this.onClick(e);
  }
});
