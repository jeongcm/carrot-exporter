import { Response } from 'express';

class ControllerExtension {
  constructor() {}

  protected resultJson(res: Response, message: string, data: any, successful?: boolean, statusCode?: number) {
    res.status(statusCode || 200).json({
      ok: typeof successful == 'boolean' ? successful : true, // default = true
      data,
      message,
    });
  }
}

export default ControllerExtension;
