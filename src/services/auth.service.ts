import bcrypt from 'bcrypt';
import config from 'config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import DB from 'databases';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { RequestWithUser } from '@interfaces/auth.interface';
import { BadRequestError } from '@/exceptions/badRequestError';
import { nextTick } from 'process';
import { TenancyModel } from '@/models/tenancy.model';
 import passport from 'passport';


class AuthService {
  public users = DB.Users;
  public tenancy = DB.Tenancies;

  public async signup(userData: CreateUserDto): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");
    let findUser: User;
    findUser = await this.users.findOne({
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

  public async info(req: RequestWithUser): Promise<any> {
    const findUser = await this.users.findAll({
      where: {
        id: req.user.id,
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

  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const secretKey: string = config.get('secretKey');
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: jwt.sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `X-AUTHORIZATION=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public async authenticate(req: RequestWithUser, res, next): Promise<any> {
    const currentCookie = req.cookies['X-AUTHORIZATION'];
    if (currentCookie) {
      const secretKey: string = config.get('secretKey');
      const payload = jwt.verify(currentCookie, secretKey) as JwtPayload;
      if (isEmpty(payload.id)) res.status(400).json({ message: 'UnAuthorized' });
      if (req.path == '/users/tenancies' && req.method == 'POST') {
        req.body['createdBy'] = payload.id;
        req.body['updatedBy'] = payload.id;
      } else {
        // if (req.body) {
        //   req.body["currentUserId"] = payload.id;
        // }
      }
    } else {
      return res.status(400).json({ message: 'UnAuthorized' });
    }
    next();
  }
}

export default AuthService;
