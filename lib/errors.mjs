export class TeachingError extends Error {
  constructor(code, message, status = 400, retryable = false) {
    super(message);
    Object.assign(this, { code, status, retryable });
  }
}

export const failure = (code, message, status, retryable) => new TeachingError(code, message, status, retryable);
