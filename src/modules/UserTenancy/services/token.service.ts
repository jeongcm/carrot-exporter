import DB from '@/database';
import { IToken } from '@/common/interfaces/token.interface';

// RYAN: this token can do more.
class TokenService {
  public tokens = DB.Tokens;

  public async createTokenDetail(tokenData): Promise<IToken> {
    const newToken: IToken = await this.tokens.create(tokenData);
    return newToken;
  }

  public async findTokenDetail(token): Promise<IToken> {
    const tokenDetail: IToken = await this.tokens.findOne({ where: { token } });
    return tokenDetail;
  }

  public async deleteTokenByToken(token): Promise<void> {
    await this.tokens.destroy({
      where: {
        token,
      },
    });
  }
}
export default TokenService;
