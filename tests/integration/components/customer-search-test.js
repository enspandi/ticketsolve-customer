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
  return !isNone(findOption(number).getAttribute('data-test-is-highlighted'));
}
function navigateDown() {
  return triggerKeyEvent('[data-test-search-input]', 'keydown', 40);
}
function navigateUp() {
  return triggerKeyEvent('[data-test-search-input]', 'keydown', 38);
}
function pressEnter() {
  return triggerKeyEvent('[data-test-search-input]', 'keydown', 13);
}

module('Integration | Component | customer-search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('When the text input is focused, expand the dropdown', async function(assert) {
    await render(hbs`{{customer-search}}`);

    await click(this.element.querySelector('[data-test-search-input]'));

    assert.ok(this.element.parentNode.querySelector('[data-test-dropdown-list]'), 'Dropdown is open');
  });
  test('When the dropdown is expanded, a `Create a new customer` option will always be visisble', async function(assert) {
    await render(hbs`{{customer-search}}`);

    await click(this.element.querySelector('[data-test-search-input]'));
    assert.ok(this.element.parentNode.querySelector('[data-test-create-btn]'), 'Create option is shown initially');

    await fillIn('[data-test-search-input]', 'J');
    assert.ok(this.element.parentNode.querySelector('[data-test-create-btn]'), 'Create option is shown during loading');

    await settled();
    assert.equal(this.element.parentNode.querySelector('[data-test-no-result-info').textContent.trim(), 'No customers found...', 'Empty result message is visible');
    assert.ok(this.element.parentNode.querySelector('[data-test-create-btn]'), 'Create option is shown when no result');

    server.create('customer', { firstName: 'John' });
    await fillIn('[data-test-search-input]', 'John');
    await settled();

    assert.equal(this.element.parentNode.querySelectorAll('[data-test-dropdown-item]').length, 1, 'One result is visible');
    assert.ok(this.element.parentNode.querySelector('[data-test-create-btn]'), 'Create option is shown when results available');
  });
  test('Show the results in a list with hovering state', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });
    await render(hbs`{{customer-search}}`);
    await fillIn('[data-test-search-input]', 'o');
    await settled();

    assert.equal(this.element.parentNode.querySelectorAll('[data-test-dropdown-item]').length, 3, 'Dropdown items are visible');

    await triggerEvent('[data-test-dropdown-item]:nth-child(2)', 'mouseover');
    assert.ok(isNone(this.element.parentNode.querySelector("[data-test-dropdown-item]:nth-child(1)").getAttribute('data-test-is-highlighted')), 'Option 1 is not highlighted');
    assert.ok(!isNone(this.element.parentNode.querySelector("[data-test-dropdown-item]:nth-child(2)").getAttribute('data-test-is-highlighted')), 'Option 2 is highlighted');
    assert.ok(isNone(this.element.parentNode.querySelector("[data-test-dropdown-item]:nth-child(3)").getAttribute('data-test-is-highlighted')), 'Option 3 is not highlighted');
  });
  test('User can use down and up arrow keys to navigate across the list', async function(assert) {
    server.create('customer', { firstName: 'John' });
    server.create('customer', { firstName: 'Tom' });
    server.create('customer', { firstName: 'Monika' });
    await render(hbs`{{customer-search}}`);
    await fillIn('[data-test-search-input]', 'o');
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
      {{#customer-search as |customer|}}
        Hello {{customer.firstName}}!
      {{/customer-search}}
    `);
    await fillIn('[data-test-search-input]', 'o');
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
    await render(hbs`{{customer-search onSelect=selectHandler}}`);
    await fillIn('[data-test-search-input]', 'o');
    await settled();

    assert.ok(this.element.parentNode.querySelector('[data-test-dropdown-list]'), 'Dropdown is open');

    await click(`[data-test-dropdown-item]:nth-child(1)`);

    assert.ok(!this.element.parentNode.querySelector('[data-test-dropdown-list]'), 'Dropdown is closed');

    await fillIn('[data-test-search-input]', 'o');
    await settled();

    assert.ok(this.element.parentNode.querySelector('[data-test-dropdown-list]'), 'Dropdown is open');

    await navigateDown();
    await pressEnter();

    assert.ok(!this.element.parentNode.querySelector('[data-test-dropdown-list]'), 'Dropdown is closed');
  });
});
