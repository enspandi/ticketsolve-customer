import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';

const validations = buildValidations(
  {
    firstName: {
      description: 'First Name',
      validators: [
        validator('length', { min: 3 })
      ]
    },
    lastName: {
      description: 'Last Name',
      validators: [
        validator('length', { min: 3 })
      ]
    },
    email: {
      description: 'E-Mail',
      validators: [
        validator('format', { type: 'email' })
      ]
    }
  }
);

export default Component.extend({
  validations
});
