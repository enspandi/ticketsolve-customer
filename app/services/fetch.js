import Service from '@ember/service';

function isError(status) {
  return ['4', '5'].includes(('' + status)[0]);
}

export default Service.extend({
  async get(url, options = null) {
    let response = await fetch(url, options);
    let json = await response.json();
    if (isError(response.status)) {
      throw json;
    }
    return json;
  },

  async put(url, data) {
    return this.get(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async post(url, data) {
    return this.get(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
});
