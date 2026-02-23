class HttpRequest {
  constructor() {
    this.baseUrl = "https://spotify.f8team.dev/api/";
  }

  _fixHttps(obj) {
    if (typeof obj === "string") {
      return obj.replace(/^http:\/\//i, "https://");
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this._fixHttps(item));
    }
    if (obj && typeof obj === "object") {
      const fixed = {};
      for (const key in obj) {
        fixed[key] = this._fixHttps(obj[key]);
      }
      return fixed;
    }
    return obj;
  }

  async _send(path, method, data, options = {}) {
    try {
      const _options = {
        ...options,
        method,
        headers: {
          ...options.headers,
        },
      };
      if (data && !(data instanceof FormData)) {
        _options.headers["Content-Type"] = "application/json";

        _options.body = JSON.stringify(data);
      } else if (data) {
        _options.body = data;
      }
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        _options.headers.Authorization = `Bearer ${accessToken}`;
      }
      const res = await fetch(`${this.baseUrl}${path}`, _options);
      const response = await res.json();
      if (!res.ok) {
        const error = new Error(`HTTP error:${res.status}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }
      return this._fixHttps(response);
    } catch (error) {
      throw error;
    }
  }
  async get(path, options) {
    return this._send(path, "GET", null, options);
  }

  async post(path, data, options) {
    return this._send(path, "POST", data, options);
  }

  async put(path, data, options) {
    return this._send(path, "PUT", data, options);
  }

  async patch(path, data, options) {
    return this._send(path, "PATCH", data, options);
  }
  async del(path, options) {
    return this._send(path, "DELETE", null, options);
  }
}
const httpRequest = new HttpRequest();
export default httpRequest;
