import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  tagName: 'li',

  classNameBindings: ['isHighlighted'],
  attributeBindings: ['role', 'ariaCurrent', 'tabindex'],
  role: 'option',
  arriaCurrent: reads('isHighlighted'),
  tabindex: '-1',

  'data-test-dropdown-item': true,
  'data-test-is-highlighted': reads('isHighlighted'),

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
