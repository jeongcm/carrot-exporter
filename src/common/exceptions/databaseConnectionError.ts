import { CustomError } from './customError';
/**
 * @param  {} {super('Errorconnectingtodb'
 * @param  {} ;Object.setPrototypeOf(this
 * @param  {} DatabaseConnectionError.prototype
 * @param  {} ;}serializeErrors(
 * @param  {this.reason}];}}} {return[{message
 * @returns this
 */
export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = 'Error connecting to database';

  constructor() {
    super('Error connecting to db');

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
