import bcrypt from 'bcrypt';
import DB from 'databases';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
import config from 'config';
const { auth } = config.get('mailgunAuth');

class UserService {
  public users = DB.Users;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.users.findAll({
      attributes: { exclude: ['password'] },
    });
    return allUser;
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findByPk(userId, { attributes: { exclude: ['password'] } });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async findUserByEmail(email: string): Promise<User> {
    if (isEmpty(email)) throw new HttpException(400, "User doen't exist");
    const findUser: User = await this.users.findOne({where:{email}});
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

  public async updateUser(userId: string, userData: any): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    const hashedPassword = await bcrypt.hash(userData.loginPw, 10);
    userData['updatedAt'] = new Date();
    await this.users.update({ ...userData, password: hashedPassword }, { where: { id: userId } });

    const updateUser: User = await this.users.findByPk(userId);
    return updateUser;
  }

  public async deleteUser(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(409, "You're not user");

    await this.users.destroy({ where: { id: userId } });

    return findUser;
  }

  public sendRecoveryMail = (req, res) => {
    try{
      const {isResetMail} = req.body;
      const emailTemplateSource = isResetMail ? fs.readFileSync(path.join(__dirname, '../templates/passwordReset.hbs'), 'utf8') : fs.readFileSync(path.join(__dirname, '../templates/recoverMail.hbs'), 'utf8');
      const mailgunAuth = {auth};
      const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));
      const template = handlebars.compile(emailTemplateSource);
      const { email, username, subject, from, reset_token } = req.body;
      const host = req.get('host');
      let link , htmlToSend
      if(!isResetMail){
        link= `http://${host}/password_resets/${reset_token}`;
        htmlToSend = template({ link, username });
      }else{
        htmlToSend = template();
      }
      const mailOptions = {
        from: from || 'jaswant.singh@exubers.com',
        to: email,
        subject: subject,
        html: htmlToSend,
      };
      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error && Object.keys(error).length) {
          return res.status(400).json({ message: 'Error while sending mail' });
        } else {
          return res.status(200).json({ message: 'Successfully sent email.' });
        }
      });
    }catch(err){
      return res.status(400).json({ message: 'Error while sending mail' });
    }
  };
}

export default UserService;