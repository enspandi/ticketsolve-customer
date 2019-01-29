import { module, test } from 'qunit';
import {
  visit,
  fillIn,
  click,
  settled
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { isNone } from '@ember/utils';


module('Acceptance | assign customers', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Assign a new customer', async function(assert) {
    await visit('/');

    await click('[data-test-dropdown-trigger]');

    await click('[data-test-create-btn]');

    assert.ok(!isNone(document.querySelector(['[data-test-customer-form'])), 'Create form is visible');

    await fillIn('[data-test-first-name] input', 'John');
    await fillIn('[data-test-last-name] input', 'Doe');
    await fillIn('[data-test-email] input', 'john.doe@hotmail.com');
    await click('[data-test-button=primary]');
    await settled();

    assert.equal(document.querySelector(['[data-test-edit-btn']).textContent.trim(), 'John Doe', 'Newly created user is assigned');
  });
  test('Assign and edit an existing customer', async function(assert) {
    this.server.create('customer', { firstName: 'John', lastName: 'Doe' });
    this.server.create('customer', { firstName: 'Smith', lastName: 'Anderson' });
    this.server.create('customer', { firstName: 'Tom', lastName: 'Prad' });

    await visit('/');

    await fillIn('[data-test-dropdown-trigger]', 'anderson');
    await settled();

    assert.equal(document.querySelectorAll('[data-test-dropdown-item]').length, 1, 'One result is visible');

    await click('[data-test-dropdown-item]');

    assert.equal(document.querySelector(['[data-test-edit-btn']).textContent.trim(), 'Smith Anderson', 'Existing user is assigned');

    await click('[data-test-edit-btn]');

    assert.ok(!isNone(document.querySelector(['[data-test-customer-form'])), 'Create form is visible');

    await fillIn('[data-test-first-name] input', 'Dr. Smith');
    await click('[data-test-button=primary]');
    await settled();

    assert.equal(document.querySelector(['[data-test-edit-btn']).textContent.trim(), 'Dr. Smith Anderson', 'Edited  created user is assigned');
  });
});
