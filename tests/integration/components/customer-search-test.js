import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, settled, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { isNone } from '@ember/utils';

// Use something like ember-cli-page-object at some point...
function findOption(number) {
  return document.querySelector(`[data-test-dropdown-item]:nth-child(${number})`)
}
function isOptionHighlighted(number) {
  return !isNone(findOption(number).getAttribute('data-test-is-active'));
}
function navigateDown() {
  return triggerKeyEvent('[data-test-dropdown-trigger]', 'keydown', 40);
}
function navigateUp() {
  return triggerKeyEvent('[data-test-dropdown-trigger]', 'keydown', 38);
}
function pressEnter() {
  return triggerKeyEvent('[data-test-dropdown-trigger]', 'keydown', 13);
}

function renderDropdown() {
  return render(hbs`
    {{#customer-search as |search|}}
      {{search.trigger}}
      {{search.dropdown}}
    {{/customer-search}}
  `);
}

function animationsSettled(ctx) {
  return ctx.emberAnimated.waitUntilIdle.perform();
}

module('Integration | Component | customer-search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.emberAnimated = this.owner.lookup('service:-ea-motion');
  });

  test('When the text input is focused, expand the dropdown', async function(assert) {
    await renderDropdown();

    await click(this.element.querySelector('[data-test-dropdown-trigger]'));

    assert.ok(document.querySelector('[data-test-dropdown]'), 'Dropdown is open');
  });
  test('When the dropdown is expanded, a `Create a new customer` option will always be visisble', async function(assert) {
    await renderDropdown();

    await click(this.element.querySelector('[data-test-dropdown-trigger]'));
    assert.ok(document.querySelector('[data-test-create-btn]'), 'Create option is shown initially');

    await fillIn('[data-test-dropdown-trigger]', 'J');
    assert.ok(document.querySelector('[data-test-create-btn]'), 'Create option is shown during loading');

    await settled();
    assert.equal(document.querySelector('[data-test-no-result').textContent.trim(), 'No customers found...', 'Empty result message is visible');
    assert.ok(document.querySelector('[data-test-create-btn]'), 'Create option is shown when no result');

    server.create('customer', { firstName: 'John' });
    await fillIn('[data-test-dropdown-trigger]', 'John');
    await settled();

    assert.equal(document.querySelectorAll('[data-test-dropdown-item]').length, 1, 'One result is visible');
    assert.ok(document.querySelector('[data-test-create-btn]'), 'Create option is shown when results available');
  });
  test('Show the results in a list with hovering state', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });
    await renderDropdown();
    await fillIn('[data-test-dropdown-trigger]', 'o');
    await settled();

    assert.equal(document.querySelectorAll('[data-test-dropdown-item]').length, 3, 'Dropdown items are visible');

    await triggerEvent('[data-test-dropdown-item]:nth-child(2)', 'mouseover');

    assert.ok(!isOptionHighlighted(1), 'Option 1 is not highlighted');
    assert.ok(isOptionHighlighted(2), 'Option 2 is highlighted');
    assert.ok(!isOptionHighlighted(3), 'Option 3 is not highlighted');
  });
  test('User can use down and up arrow keys to navigate across the list', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });
    await renderDropdown();
    await fillIn('[data-test-dropdown-trigger]', 'o');
    await settled();

    await navigateDown();
    assert.ok(isOptionHighlighted(1) && !isOptionHighlighted(2) &&  !isOptionHighlighted(3), 'Option 1 is highlighted');

    await navigateDown();
    assert.ok(!isOptionHighlighted(1) && isOptionHighlighted(2) &&  !isOptionHighlighted(3), 'Option 2 is highlighted');

    await navigateDown();
    assert.ok(!isOptionHighlighted(1) && !isOptionHighlighted(2) &&  isOptionHighlighted(3), 'Option 3 is highlighted');

    await navigateUp();
    assert.ok(!isOptionHighlighted(1) && isOptionHighlighted(2) &&  !isOptionHighlighted(3), 'Option 2 is highlighted');

    await navigateUp();
    assert.ok(isOptionHighlighted(1) && !isOptionHighlighted(2) &&  !isOptionHighlighted(3), 'Option 1 is highlighted');
  });
  test('Renders each result using a custom block', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });
    await render(hbs`
      {{#customer-search as |search|}}
        {{search.trigger}}
        {{#search.dropdown as |customer|}}
          Hello {{customer.firstName}}!
        {{/search.dropdown}}
      {{/customer-search}}
    `);
    await fillIn('[data-test-dropdown-trigger]', 'o');
    await settled();

    await navigateDown();
    await navigateDown();
    assert.ok(isOptionHighlighted(2), 'Option 2 is highlighted inside custom block');
    assert.equal(document.querySelector(`[data-test-dropdown-item]:nth-child(2)`).textContent.trim(), 'Hello Tom!', 'Option 2 use custom block')
  });
  test('When user clicks or presses enter in a result, hide the results list and call an action passed to the component.', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });

    assert.expect(6);
    this.set(
      'selectHandler',
      (customer) => assert.equal(customer.firstName, 'John', 'Click and enter key invokes select handler')
    );
    await render(hbs`
      {{#customer-search onSelect=selectHandler as |search|}}
        {{search.trigger}}
        {{search.dropdown}}
      {{/customer-search}}
    `);

    await fillIn('[data-test-dropdown-trigger]', 'o');
    await settled();

    assert.ok(document.querySelector('[data-test-dropdown]'), 'Dropdown is open 1');
    await click(`[data-test-dropdown-item]:nth-child(1)`);

    await animationsSettled(this);
    assert.ok(!document.querySelector('[data-test-dropdown]'), 'Dropdown is closed 1');

    await fillIn('[data-test-dropdown-trigger]', 'o');
    await settled();
    await animationsSettled(this);

    assert.ok(document.querySelector('[data-test-dropdown]'), 'Dropdown is open 2');
    await navigateDown();
    await pressEnter();

    await animationsSettled(this);
    assert.ok(!document.querySelector('[data-test-dropdown]'), 'Dropdown is closed 2');
  });
});
