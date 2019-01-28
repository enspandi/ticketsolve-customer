import Component from '@ember/component';
import { computed } from '@ember/object';
import { isNone } from '@ember/utils';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ENTER = 13;

export default Component.extend({
  localClassNames: ['dropdown-container'],

  didSearch: computed('options', function() {
    return !isNone(this.options);
  }),

  didInsertElement() {
    this._super(...arguments);
    if (this.attachTo) {
      this._setParentWidth();
      this._registerKeyListener();
    }
  },

  _setParentWidth() {
    this.set('dropdownStyle', `width: ${this.attachTo.offsetWidth}px`);
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.attachTo) {
      this._removeKeyListener();
    }
  },
  _registerKeyListener() {
    let keyDownListener = (e) => this.keyDownParent(e);
    this.attachTo.addEventListener('keydown', keyDownListener);
    this.set('keyListener', keyDownListener);
  },
  _removeKeyListener() {
    this.attachTo.removeEventListener('keydown', this.keyDownListener);
  },

  keyDownParent(e) {
    if (e.keyCode === KEY_DOWN) {
      this.nextActive();
    } else if (e.keyCode === KEY_UP) {
      this.prevActive();
    } else if (e.keyCode === KEY_ENTER) {
      this.onSelect(this.activeOption);
    }
  },

  activeIdx: null,
  activeOption: computed('activeIdx', 'options.length', function() {
    return !isNone(this.activeIdx) && this.options[this.activeIdx];
  }),
  setActive(option) {
    if (!isNone(this.options)) {
      this.set('activeIdx', this.options.indexOf(option));
    }
  },
  nextActive() {
    if (!isNone(this.options)) {
      this.set('activeIdx', this._nextActiveByOffset(1));
    }
  },
  prevActive() {
    if (!isNone(this.options)) {
      this.set('activeIdx', this._nextActiveByOffset(-1));
    }
  },
  _nextActiveByOffset(offset) {
    if (isNone(this.activeIdx)) {
      return 0;
    }
    let activeIdx = this.activeIdx + offset;
    let maxIdx = this.options.length - 1;
    if (activeIdx < 0) {
      activeIdx = maxIdx;
    } else if (activeIdx > maxIdx) {
      activeIdx = 0;
    }
    return activeIdx;
  },

  actions: {
    setActive(option) {
      this.setActive(option);
    }
  }
});
