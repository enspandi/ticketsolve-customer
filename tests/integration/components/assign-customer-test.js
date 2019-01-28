import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { isNone } from '@ember/utils';

module('Integration | Component | assign-customer', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('Icon is always visible', async function(assert) {
    server.create('customer', { firstName: 'John', lastName: 'Doe' });
    await render(hbs`{{assign-customer}}`);
    assert.ok(!isNone(this.element.querySelector('[data-test-icon]')), 'Icon visible at initial render');
    await fillIn('input', 'John');
    await settled();
    assert.ok(!isNone(this.element.querySelector('[data-test-icon]')), 'Icon visible when dropdown open');

    await click('[data-test-dropdown-item]');

    assert.ok(!isNone(this.element.querySelector('[data-test-icon]')), 'Icon visible when user chosen');

    await click('[data-test-remove-btn]');

    assert.ok(!isNone(this.element.querySelector('[data-test-icon]')), 'Icon visible when no customer');
  });
  test('Select a customer', async function(assert) {
    server.create('customer', { firstName: 'John', lastName: 'Doe' });
    await render(hbs`{{assign-customer}}`);
    await fillIn('input', 'John');
    await settled();
    await click('[data-test-dropdown-item]');
    assert.equal(this.element.querySelector('[data-test-edit-btn]').textContent.trim(), 'John Doe', 'Customer is selected');
  });
  test('Remove a customer', async function(assert) {
    server.create('customer', { firstName: 'John', lastName: 'Doe' });
    await render(hbs`{{assign-customer}}`);
    assert.ok(isNone(this.element.querySelector('[data-test-edit-btn')), 'No customer selected');
    await fillIn('input', 'John');
    await settled();
    await click('[data-test-dropdown-item]');
    assert.ok(!isNone(this.element.querySelector('[data-test-edit-btn')), 'Customer is selected');
    await click('[data-test-remove-btn]');
    assert.ok(isNone(this.element.querySelector('[data-test-edit-btn')), 'No customer selected after remove');
  });
});
