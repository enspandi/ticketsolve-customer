import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  firstName: () => faker.name.firstName(),
  lastName: () => faker.name.lastName(),
  email: () => faker.internet.email(),
  phone: () => faker.phone.phoneNumberFormat(3),
  mobile: () => faker.phone.phoneNumberFormat(3),
  birthdate: "1986-01-02"
});
