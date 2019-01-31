import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads, not } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { task, timeout } from 'ember-concurrency';
import { statechart, matchesState } from 'ember-statecharts/computed';
import ENV from 'ticketsolve-customer/config/environment';

export default Component.extend({
  ticketsolve: service(),

  isIdle: matchesState('idle'),
  isFocused: matchesState('focus'),
  isTyping: matchesState('typing'),
  isSearching: matchesState('searching'),
  isSearchSuccess: matchesState('searchSuccess'),
  isSearchError: matchesState('searchError'),
  isSelect: matchesState('select'),
  isCreate: matchesState('create'),

  isDropdownOpen: not('isIdle'),
  isLoading: reads('isSearching'),

  statechart: statechart({
    initial: 'idle',

    states: {
      idle: {
        on: { focus: 'focus' }
      },
      focus: {
        on: {
          blur: { target: 'idle', cond: 'clickIsOutside' },
          create: 'create',
          select: 'select',
          input: 'typing'
        }
      },
      typing: {
        onEntry: ['handleTyping'],
        on: { searching: 'searching' }
      },
      searching: {
        onEntry: ['handleSearching'],
        on: {
          blur: { target: 'idle', cond: 'clickIsOutside' },
          input: 'typing',
          create: 'create',
          succeeded: 'searchSuccess',
          errored: 'searchError'
        }
      },
      searchSuccess: {
        onEntry: ['handleSearchSuccess'],
        on: {
          blur: { target: 'idle', cond: 'clickIsOutside' },
          input: 'typing',
          create: 'create',
          select: 'select'
        }
      },
      searchError: {
        onEntry: ['handleSearchError'],
        on: {
          blur: { target: 'idle', cond: 'clickIsOutside' },
          input: 'typing',
          create: 'create'
        }
      },
      select: {
        onEntry: ['handleSelect'],
        on: { manuelClose: 'idle' }
      },
      create: {
        onEntry: ['handleCreate'],
        on: { manuelClose: 'idle' }
      }
    }
  }, {
    guards: {
      clickIsOutside(ctx, { data: event }) {
        return !event.relatedTarget || !ctx.isChildElement(event.relatedTarget);
      }
    },
    actions: {
      handleCreate() {
        this.statechart.send('manuelClose');
        this.onCreate();
      },
      handleSelect(customer) {
        this.statechart.send('manuelClose');
        this.onSelect(customer);
      },
      handleTyping(value) {
        return this.statechart.send('searching', value);
      },
      handleSearching(value) {
        this.setProperties({ keyword: null, customers: null, error: null });
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

  debounceSearch: task(function*(keyword) {
    yield timeout(ENV.environment === 'test' ? 0 : 350);
    return this.ticketsolve.queryCustomers(keyword);
  }).restartable().evented(),

  searchSuccess: on('debounceSearch:succeeded', function({ args, value }) {
    this.statechart.send('succeeded', { keyword: args[0], customers: value });
  }),
  searchError: on('debounceSearch:errored', function({ error }) {
    this.statechart.send('errored', error);
  }),

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
