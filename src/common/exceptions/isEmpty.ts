/**
 * @param  {number} status
 * @param  {string} message
 */
export class IsEmptyError extends Error {
  public status: 400;
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
