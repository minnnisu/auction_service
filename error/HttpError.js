class HttpError extends Error {
  constructor(status, message, option) {
    super(message);
    this.status = status;
    this.option = option;
  }
}

module.exports = HttpError;
