import Service from '@ember/service';

export default Service.extend({
  async queryCustomers(keyword) {
    let url = `/api/customers?filter=${keyword}`;

    let response = await fetch(url);
    return await response.json();
  }
});
