import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { isNone } from '@ember/utils';

module('Integration | Component | ui-form', function(hooks) {
  setupRenderingTest(hooks);

  test('When there are no changes to the buffer, the submit button is disabled', async function(assert) {
    this.set('model', EmberObject.create({
      firstName: ''
    }));
    await render(hbs`
      {{#ui-form model=model as |form|}}
        {{form.input field='firstName'}}
        {{#form.submit}}Submit Button{{/form.submit}}
      {{/ui-form}}
    `);

    assert.ok(
      !isNone(this.element.querySelector('button[disabled]')),
      'Submit button is disabled'
    );

    await fillIn('input', 'Hello there');

    assert.ok(
      isNone(this.element.querySelector('button[disabled]')),
      'Submit button is enabled'
    );

    await fillIn('input', '');

    assert.ok(
      !isNone(this.element.querySelector('button[disabled]')),
      'Submit button is disabled'
    );
  });
});
