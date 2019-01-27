import { isBlank } from '@ember/utils';

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
    if (!isBlank(keyword)) {
      return filterByKeyword(
        schema.db.customers,
        ['firstName', 'lastName', 'email', 'phone', 'mobile'],
        keyword
      );
    }
    return schema.db.customers;
  });
}
