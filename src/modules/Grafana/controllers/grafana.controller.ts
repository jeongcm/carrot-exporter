import { NextFunction, Response } from 'express';
import { IRequestWithUser } from '@/common/interfaces/party.interface';

const HARD_CODED_ACCESS_TOKEN = 'X&Gi}]$KU0beR<F';
const HARD_CODED_REFRESH_TOKEN = '*Dgl$+r5=/T%,Rx';

class GrafanaController {
  public getGrafanaLoginCode = async (req: IRequestWithUser, res: Response, next: NextFunction) => {};

  public issueGrafanaToken = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    res.status(200).json({
      access_token: HARD_CODED_ACCESS_TOKEN,
      token_type: 'Bearer',
      expiry_in: '1295998',
      refresh_token: HARD_CODED_REFRESH_TOKEN,
    });
  };

  public verifyGrafanaToken = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
    res.status(200).json({
      email: 'admin@localhost',
    });
  };
}

export default GrafanaController;
