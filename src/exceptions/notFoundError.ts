import { CustomError } from './customError';
/**
 * @param  {} {super('Routenotfound'
 * @param  {} ;Object.setPrototypeOf(this
 * @param  {} NotFoundError.prototype
 * @param  {} ;}serializeErrors(
 * @param  {'NotFound'}];}}} {return[{message
 * @returns NotFound
 */
export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor() {
    super('Route not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
