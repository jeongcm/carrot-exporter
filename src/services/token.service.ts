import bcrypt from 'bcrypt';
import DB from 'databases';
import { IToken } from '@interfaces/token.interface';

// RYAN: this token can do more.
class TokenService {
  public tokens = DB.Tokens;

  public async createTokenDetail(tokenData): Promise<IToken> {
    const newToken: IToken = await this.tokens.create(tokenData);
    return newToken;
  }

  public async findTokenDetail(token): Promise<IToken> {
    const tokenDetail: IToken = await this.tokens.findOne({where:{token}});
    return tokenDetail;
  }

}
export default TokenService;
