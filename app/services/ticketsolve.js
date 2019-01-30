import Service, { inject as service } from '@ember/service';

export default Service.extend({
  fetch: service(),

  async queryCustomers(keyword) {
    return await this.fetch.get(`/api/customers?filter=${keyword}`);
  },

  async updateCustomer(customer) {
    return await this.fetch.put(`/api/customers/${customer.id}`, {
      data: {
        id: customer.id,
        type: 'customers',
        attributes: customer
      }
    });
  },

  async createCustomer(customer) {
    let json = await this.fetch.post('/api/customers', {
      data: {
        type: 'customers',
        attributes: customer
      }
    });
    return {...json.data.attributes, ...{ id: json.data.id }};
  }
});
