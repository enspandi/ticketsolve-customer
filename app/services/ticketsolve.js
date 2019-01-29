import Service from '@ember/service';

export default Service.extend({
  async queryCustomers(keyword) {
    let url = `/api/customers?filter=${keyword}`;

    let response = await fetch(url);
    return await response.json();
  },

  async updateCustomer(customer) {
    let url = `/api/customers/${customer.id}`;
    let options = {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          id: customer.id,
          type: 'customers',
          attributes: customer
        }
      })
    };

    let response = await fetch(url, options);
    return await response.json();
  },

  async createCustomer(customer) {
    let url = `/api/customers`;
    let options = {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'customers',
          attributes: customer
        }
      })
    };

    let response = await fetch(url, options);
    let json = await response.json();

    return json.data.attributes;
  }
});
