import { CustomError } from './customError';
/**
 * @param  {} {super('NotAuthorized'
 * @param  {} ;Object.setPrototypeOf(this
 * @param  {} NotAuthorizedError.prototype
 * @param  {} ;}serializeErrors(
 * @param  {'Notauthorized'}];}}} {return[{message
 * @returns Notauthorized
 */
export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super('Not Authorized');

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not authorized' }];
  }
}
