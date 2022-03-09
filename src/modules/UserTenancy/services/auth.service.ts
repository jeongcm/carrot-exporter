import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import DB from '@/database';
import { CreateUserDto } from '@/modules/UserTenancy/dtos/user.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@/common/interfaces/auth.interface';
import { User } from '@/common/interfaces/users.interface';
import { isEmpty } from '@/common/utils/util';
import { TenancyModel } from '@/modules/UserTenancy/models/tenancy.model';
import config from 'config';

/**
 *
 *
 * @memberof UserTenancy
 */
class AuthService {
  public users = DB.Users;
  public tenancy = DB.Tenancies;

  /**
   * @param  {CreateUserDto} userData
   * @returns {"Promise<User>"} a promise that returns User object
   */
  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({
      where: { email: userData.email },
    });

    if (findUser) throw new HttpException(400, `You're email ${userData.email} already exists`);

    const hashedPassword = await bcrypt.hash(userData.loginPw, 10);
    const currentDate = new Date();
    const user = {
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      mobile: userData.mobile,
      photo: userData.photo,
      lastAccess: currentDate,
      updatedAt: currentDate,
      createdAt: currentDate,
    };
    const createUserData: User = await this.users.create(user);

    return createUserData;
  }

  /**
   * @param  {CreateUserDto} userData
   * @returns {"Promise<{ cookie: string; findUser: User; token: string }>"} a promise that returns (1) cookie (2) User Object (3) auth token
   */
  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User; token: string }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: User = await this.users.findOne({ where: { email: userData.email } });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await bcrypt.compare(userData.loginPw, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser, token: tokenData.token };
  }

  /**
   * @param  {string} id
   * @returns Promise
   */
  public async getUser(id): Promise<User> {
    const findUser = await this.users.findAll({
      where: {
        id,
      },
      include: [
        {
          model: TenancyModel,
          attributes: ['id', 'tenancyCode', 'tenancyName', 'tenancyDescription', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'isDeleted'],
          as: 'currentTenancy',
        },
      ],
    });
    if (findUser) {
      return findUser[0];
    } else {
      return null;
    }
  }

  /**
   * Mainly serving /me controller
   *
   * @param  {string} id
   * @returns Promise<User>
   * @author Ryan Lee <ryan@nexclipper.io>
   */
  public async getMeUser(id): Promise<User> {
    const findUser = await this.users.findOne({
      where: {
        id,
      },
      attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'mobile', 'photo', 'socialProviderId', 'currentTenancyPk', 'lastAccess'],
      include: [
        {
          model: TenancyModel,
          attributes: ['id', 'tenancyCode', 'tenancyName', 'tenancyDescription', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'isDeleted'],
          as: 'currentTenancy',
        },
      ],
    });
    if (findUser) {
      return findUser;
    } else {
      return null;
    }
  }

  /**
   * @param  {User} user
   * @returns TokenData
   */
  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { pk: user.pk };
    const secretKey: string = config.auth.jwtSecretKey;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  /**
   * @param  {TokenData} tokenData
   * @returns string cookie string that sets X-AUTHORIZATION and Max-Age
   */
  public createCookie(tokenData: TokenData): string {
    return `X-AUTHORIZATION=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
