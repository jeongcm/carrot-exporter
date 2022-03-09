import bcrypt from 'bcrypt';
import DB from '@/database';
import { CreateUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { User } from '@/common/interfaces/users.interface';
import { isEmpty } from '@/common/utils/util';
import config from 'config';
import urlJoin from 'url-join';

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const auth = {
  api_key: config.email.mailgun.apiKey,
  domain: config.email.mailgun.domain,
};
class UserService {
  public users = DB.Users;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.users.findAll({
      attributes: { exclude: ['password'] },
    });
    return allUser;
  }

  public async findUserByPk(userPk: number): Promise<User> {
    if (isEmpty(userPk)) throw new HttpException(400, 'Missing UserId');

    const findUser: User = await this.users.findByPk(userPk, { attributes: { exclude: ['password'] } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, 'Missing UserId');

    const findUser: User = await this.users.findOne({ where: { id: userId }, attributes: { exclude: ['password'] } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserByEmail(email: string): Promise<User> {
    if (isEmpty(email)) throw new HttpException(400, "User doen't exist");
    const findUser: User = await this.users.findOne({ where: { email } });
    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ where: { email: userData.email } });

    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exist`);

    const hashedPassword = await bcrypt.hash(userData.loginPw, 10);
    const createUserData: User = await this.users.create({
      ...userData,
      password: hashedPassword,
    });

    return createUserData;
  }

  public async updateUserById(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ where: { id: userId }});
    if (!findUser) throw new HttpException(409, "You're not user");

    const hashedPassword = await bcrypt.hash(userData.loginPw, 10);
    userData['updatedAt'] = new Date();
    await this.users.update({ ...userData, password: hashedPassword }, { where: { id: userId } });

    const updateUser: User = await this.users.findByPk(findUser.pk);
    return updateUser;
  }

  public async updateUserPassword(userPk: number, password: string): Promise<User> {
    if (isEmpty(password)) throw new HttpException(400, 'new password is missing');

    const findUser: User = await this.users.findByPk(userPk);
    if (!findUser) throw new HttpException(409, 'no user found');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.users.update({ password: hashedPassword, updatedAt: new Date() }, { where: { pk: userPk } });

    const updateUser: User = await this.users.findByPk(userPk);
    return updateUser;
  }

  public async deleteUser(userPk: number): Promise<User> {
    if (isEmpty(userPk)) throw new HttpException(400, "You're not userPk");

    const findUser: User = await this.users.findByPk(userPk);
    if (!findUser) throw new HttpException(409, "You're not user");

    await this.users.destroy({ where: { id: userPk } });

    return findUser;
  }

  public sendRecoveryMail = (req, res) => {
    try {
      const { isResetMail, email, username, subject, reset_token } = req.body;
      const emailTemplateSource = isResetMail
        ? fs.readFileSync(path.join(__dirname, '../templates/emails/email-body/passwordReset.hbs'), 'utf8')
        : fs.readFileSync(path.join(__dirname, '../templates/emails/email-body/recoveryMail.hbs'), 'utf8');
      const mailgunAuth = { auth };
      const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
      const template = handlebars.compile(emailTemplateSource);
      let link, htmlToSend;
      if (!isResetMail) {
        link = urlJoin(config.email.passwordReset.resetPageURL, reset_token);
        htmlToSend = template({ link, username });
      } else {
        htmlToSend = template();
      }
      const mailOptions = {
        from: config.email.defaultFrom,
        to: email,
        subject: subject,
        html: htmlToSend,
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          return res.status(400).json({ message: 'Error while sending mail', error });
        } else {
          return res.status(200).json({ message: 'Successfully sent email.' });
        }
      });
    } catch (err) {
      return res.status(400).json({ message: 'Error while sending mail', error: err });
    }
  };
}

export default UserService;
