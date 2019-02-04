import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads, not } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';
import { statechart, matchesState } from 'ember-statecharts/computed';
import ENV from 'ticketsolve-customer/config/environment';
import { isBlank } from '@ember/utils';

export default Component.extend({
  ticketsolve: service(),

  isClosed: matchesState('closed'),
  isFocused: matchesState('focus.idle'),
  isTyping: matchesState('focus.typing'),
  isSearching: matchesState('focus.searching'),
  isSearchSuccess: matchesState('focus.searchSuccess'),
  isSearchError: matchesState('focus.searchError'),
  isSelect: matchesState('focus.select'),
  isCreate: matchesState('focus.create'),

  isDropdownOpen: not('isClosed'),
  isLoading: reads('isSearching'),

  statechart: statechart({
    initial: 'closed',

    states: {
      closed: {
        onEntry: ['handleClosed'],
        on: { focus: 'focus' }
      },
      focus: {
        initial: 'idle',
        on: {
          blur: { target: 'closed', cond: 'clickIsOutside' },
          close: { target: 'closed' }
        },
        states: {
          idle: {
            on: {
              create: 'create',
              select: 'select',
              input: 'typing'
            }
          },
          typing: {
            onEntry: ['handleTyping'],
            on: {
              empty: 'idle',
              searching: 'searching'
            }
          },
          searching: {
            onEntry: ['handleSearching'],
            on: {
              input: 'typing',
              create: 'create',
              succeeded: 'searchSuccess',
              errored: 'searchError'
            }
          },
          searchSuccess: {
            onEntry: ['handleSearchSuccess'],
            on: {
              input: 'typing',
              create: 'create',
              select: 'select'
            }
          },
          searchError: {
            onEntry: ['handleSearchError'],
            on: {
              input: 'typing',
              create: 'create'
            }
          },
          select: {
            onEntry: ['handleSelect']
          },
          create: {
            onEntry: ['handleCreate']
          }
        }
      }
    }
  }, {
    guards: {
      clickIsOutside(ctx, { data: event }) {
        return !event.relatedTarget || !ctx.isChildElement(event.relatedTarget);
      }
    },
    actions: {
      handleClosed() {
        this._clearState();
      },
      handleCreate() {
        this.statechart.send('close');
        this.onCreate();
      },
      handleSelect(customer) {
        this.statechart.send('close');
        this.onSelect(customer);
      },
      handleTyping(value) {
        this._clearState();
        if (isBlank(value)) {
          return this.statechart.send('empty');
        }
        return this.statechart.send('searching', value);
      },
      handleSearching(value) {
        this.debounceSearch.perform(value);
      },
      handleSearchSuccess({ keyword, customers }) {
        this.setProperties({ keyword, customers });
      },
      handleSearchError(fetchError) {
        let description = fetchError.errors.mapBy('description').join('.');
        this.set('error', `Search failed: ${description}`);
      }
    }
  }),

  onSelect: () => {},
  onCreate: () => {},

  _clearState() {
    this.setProperties({ keyword: null, customers: null, error: null });
  },

  debounceSearch: task(function*(keyword) {
    yield timeout(ENV.environment === 'test' ? 0 : 350);
    try {
      let customers = yield this.ticketsolve.queryCustomers(keyword);
      this.statechart.send('succeeded', { keyword, customers });
    } catch (error) {
      this.statechart.send('errored', error);
    }
  }).restartable(),

  isChildElement(child) {
    return this.element.contains(child) || child.getAttribute('aria-owns') === this.elementId;
  },

  actions: {
    focus() {
      this.statechart.send('focus');
    },
    blur(e) {
      this.statechart.send('blur', e);
    },
    input(value) {
      this.statechart.send('input', value);
    },
    select(customer) {
      this.statechart.send('select', customer);
    },
    create() {
      this.statechart.send('create');
    }
  }
});
