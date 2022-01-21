// import bcrypt from 'bcrypt';
// import DB from 'databases';
// import { CreateUserDto } from '@dtos/users.dto';
// import { HttpException } from '@exceptions/HttpException';
// import { IToken } from '@interfaces/token.interface';
// import { isEmpty } from '@utils/util';
// const nodemailer = require('nodemailer');
// const mg = require('nodemailer-mailgun-transport');
// const handlebars = require('handlebars');
// const fs = require('fs');
// const path = require('path');
// import config from 'config';
// const { auth } = config.get('mailgunAuth');

// class TokenService {
//   public tokens = DB.Tokens;

//   public async createTokenDetail(tokenData): Promise<IToken> {
//     const newToken: IToken = await this.tokens.create(tokenData);
//     return newToken;
//   }

//   public async findTokenDetail(token): Promise<IToken> {
//     const tokenDetail: IToken = await this.tokens.findOne({where:{token}});
//     return tokenDetail;
//   }

// }
// export default TokenService;