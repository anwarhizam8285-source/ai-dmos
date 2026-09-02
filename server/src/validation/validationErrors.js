export class ValidationError extends Error {
  constructor(errors) {
    super(Array.isArray(errors) ? errors.join("; ") : String(errors));
    this.name = "ValidationError";
    this.errors = Array.isArray(errors) ? errors : [String(errors)];
    this.status = 400;
  }
}

export default ValidationError;
