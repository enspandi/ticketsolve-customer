import { isBlank } from '@ember/utils';
import { Response } from 'ember-cli-mirage';


function filterByFullName(records, name) {
  name = name.toLowerCase();
  return records.filter(({ firstName = '', lastName = '' }) => {
    let fullName = `${firstName} ${lastName}`.toLowerCase();
    return fullName.includes(name);
  });
}

function filterByKeyword(records, attrs, keyword) {
  keyword = keyword.toLowerCase();
  return records.filter((record) => {
    return attrs.any((attr) => {
      return !isBlank(record[attr]) && record[attr].toLowerCase().includes(keyword);
    });
  });
}

const FORBIDDEN_EOMJI = "🧐";

export default function() {
  this.namespace = 'api';

  this.get('/customers', (schema, request) => {
    let keyword = request.queryParams['filter'];
    if (keyword.includes(FORBIDDEN_EOMJI)) {
      return new Response(422, {some: 'header', 'Content-Type': 'application/json'}, {
        errors: [{
          status: 422,
          title: 'keyword is invalid',
          description: `Cannot search for emojis ${FORBIDDEN_EOMJI}`
        }]
      });
    }

    let allCustomers = schema.db.customers;
    if (!isBlank(keyword)) {
      let resultByFullName = filterByFullName(allCustomers, keyword);
      let resultByKeyword  = filterByKeyword(
        allCustomers,
        ['firstName', 'lastName', 'email', 'phone', 'mobile'],
        keyword
      );
      return [...new Set(resultByFullName.concat(resultByKeyword))];
    }
    return allCustomers;
  });
  this.post('/customers');
  this.put('/customers/:id');
}
