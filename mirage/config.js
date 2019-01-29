import { isBlank } from '@ember/utils';

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

export default function() {
  this.namespace = 'api';

  this.get('/customers', (schema, request) => {
    let keyword = request.queryParams['filter'];
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
