import { User } from '@/common/interfaces/users.interface';
import { UserModel } from '@/modules/UserTenancy/models/users.model';
import DB from '@/database';
import { CreateTenancyDto, CreatedTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { Tenancy } from '@/common/interfaces/tenancy.interface';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
import { isEmpty } from '@/common/utils/util';
import getToken from '@/common/utils/getToken';
import { UserRole } from '@/common/enums';
import { Op } from 'sequelize';
class TenancyService {
  public tenancies = DB.Tenancies;
  public tenancyMember = DB.TenancyMembers;
  public user = DB.Users;

  public async findAllTenancy(): Promise<Tenancy[]> {
    const tenancies: Tenancy[] = await this.tenancies.findAll({ where: { isDeleted: false } });
    return tenancies;
  }

  public async findUserTenanciesByUserPk(userPk: number): Promise<Tenancy[]> {
    const tenancies: Tenancy[] = await this.tenancies.findAll({
      where: { isDeleted: false },
      attributes: {
        exclude: ['pk', 'createdBy', 'updatedBy'],
      },
      include: [
        {
          model: DB.TenancyMembers,
          where: {
            userPk,
          },
          required: false,
          right: true,
        },
      ],
    });

    return tenancies;
  }

  public async findTenancyById(id: string): Promise<Tenancy> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid tenancy');

    const findTenancy: Tenancy = await this.tenancies.findOne({ where: { id } });
    if (!findTenancy) throw new HttpException(409, 'Tenancy Not found');

    return findTenancy;
  }

  // RYAN: need to add check if tenancyCode is duplicated
  /**
   * @param  {CreateTenancyDto} tenancyData
   * @param  {User} currentUser
   * @returns Promise<CreatedTenancyDto>
   */
  public async createTenancy(tenancyData: CreateTenancyDto, currentUser: User): Promise<CreatedTenancyDto> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');
    const newTenancy = {
      tenancyCode: tenancyData.tenancyCode,
      tenancyDescription: tenancyData.tenancyDescription,
      tenancyName: tenancyData.tenancyName,
      createdBy: tenancyData.createdBy,
      updatedBy: tenancyData.updatedBy,
      updatedAt: tenancyData.updatedAt,
      createdAt: tenancyData.createdAt,
      isDeleted: tenancyData.isDeleted,
    };

    const createdTenancy: Tenancy = await this.tenancies.create(newTenancy);

    await this.createTenancyMember(currentUser.pk, createdTenancy.pk, currentUser.pk, {
      userRole: UserRole.OWNER,
    });

    return {
      createdAt: createdTenancy.createdAt,
      updatedAt: createdTenancy.updatedAt,
      id: createdTenancy.id,
      tenancyCode: createdTenancy.tenancyCode,
      tenancyDescription: createdTenancy.tenancyDescription,
      tenancyName: createdTenancy.tenancyName,
    };
  }

  /**
   *
   *
   * @param  {string} tenancyId
   * @param  {number} ownerPk
   * @param  {CreateTenancyDto} tenancyData
   * @returns Promise<boolean>
   */
  public async updateTenancyById(tenancyId: string, ownerPk: number, tenancyData: CreateTenancyDto): Promise<boolean> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');

    const findTenancy: Tenancy = await this.tenancies.findOne({
      where: {
        id: tenancyId,
        isDeleted: 0,
      },
      include: [
        {
          model: DB.TenancyMembers,
          where: {
            userPk: ownerPk,
            userRole: UserRole.OWNER,
          },
        },
      ],
    });

    if (!findTenancy) throw new HttpException(409, "Tenancy with the user as an owner doesn't exist");

    const result = await this.tenancies.update({ ...tenancyData }, { where: { id: tenancyId, isDeleted: 0 } });

    return result.indexOf(1) > -1;
  }

  /**
   * @param  {string} tenancyId
   * @param  {number} userPk
   * @returns Promise<boolean>
   */
  public async deleteTenancyById(tenancyId: string, userPk: number): Promise<boolean> {
    if (isEmpty(tenancyId)) throw new HttpException(400, 'Tenancyid is required');

    // STEP 1. check the role
    const owner = await this.tenancyMember.findOne({
      where: {
        userPk,
        userRole: UserRole.OWNER,
      },
      include: [
        {
          model: DB.Tenancies,
          where: {
            id: tenancyId,
          },
        },
      ],
    });
    if (!owner) throw new HttpException(409, 'user not an owner');

    // STEP 2. Find a tenancy to mark as delete.
    const findTenancy: Tenancy = await this.tenancies.findOne({ where: { id: tenancyId } });
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    const result = await this.tenancies.update({ isDeleted: true }, { where: { id: tenancyId } });
    return result.indexOf(1) > -1;
  }

  /**
   * @param  {CreateTenancyMemberDto} tenancyMemberData
   * @param  {number} currentUserPk
   * @returns Promise<TenancyMember>
   */
  public async createTenancyMember(
    currentUserPk: number,
    tenancyPk: number,
    targetUserPk: number,
    tenancyMemberData: CreateTenancyMemberDto,
  ): Promise<TenancyMember> {
    if (isEmpty(tenancyMemberData)) throw new HttpException(400, 'Tenancy Member Data cannot be blank');
    const newTenancyMember = {
      userName: '',
      userPk: targetUserPk,
      tenancyPk: tenancyPk,
      invitedBy: currentUserPk,
      verificationCode: getToken(),
      userRole: tenancyMemberData.userRole,
      isDeleted: false,
      isActivated: false,
    };
    const createTenancyData: TenancyMember = await this.tenancyMember.create(newTenancyMember);
    return createTenancyData;
  }

  /**
   * @param  {string} tenancyId
   * @returns Promise<TenancyMember[]>
   */
  public async findAllTenancyMembers(tenancyId: string): Promise<TenancyMember[]> {
    const allTenancyMembers: TenancyMember[] = await this.tenancyMember.findAll({
      where: {
        isDeleted: 0,
      },
      attributes: {
        exclude: ['pk', 'userPk', 'tenancyPk', 'updatedAt', 'TenancyModel', 'isDeleted', 'invitedBy'],
      },
      include: [
        {
          model: DB.Tenancies,
          where: {
            id: tenancyId,
          },
          required: true,
          right: true,
          attributes: [], // <-- do not return fields from DB.Tenancies
        },
      ],
    });

    return allTenancyMembers;
  }

  public async deleteTenancyMemberById(currentUserPk: number, tenancyId: string, memberId: string): Promise<boolean> {
    if (isEmpty(tenancyId)) throw new HttpException(400, 'Tenancyid is required');

    const tenancyMember = await this.tenancyMember.findOne({
      where: {
        [Op.and]: {
          id: memberId,
          isDeleted: false,
          userPk: {
            [Op.ne]: currentUserPk,
          },
        },
      },
      include: [
        {
          model: DB.Tenancies,
          required: true,
          where: {
            id: tenancyId,
            isDeleted: false,
          },
          include: [
            {
              model: DB.TenancyMembers,
              required: true,
              where: {
                userPk: currentUserPk,
                isDeleted: false,
                [Op.or]: [
                  {
                    userRole: UserRole.OWNER,
                  },
                  {
                    userRole: UserRole.MAINTAINER,
                  },
                ],
              },
            },
          ],
        },
      ],
    });

    if (!tenancyMember) {
      return false;
    }

    const destroyed = await this.tenancyMember.update({ isDeleted: true }, { where: { pk: tenancyMember.pk } });

    return destroyed.indexOf(1) > -1;
  }

  public async updateUserCurrentTenancy(userPk, tenancyId: string): Promise<boolean> {
    if (isEmpty(tenancyId)) throw new HttpException(400, 'tenancyPk is required');
    const userDetail: User = await this.user.findByPk(userPk);

    const tenancyDetail: Tenancy = await this.tenancies.findOne({
      where: {
        id: tenancyId,
      },
    });

    if (!userDetail) throw new HttpException(400, "User doesn't exist");
    if (!tenancyDetail) throw new HttpException(400, "Tenancy doesn't exist");

    const result = await this.user.update({ currentTenancyPk: tenancyDetail.pk }, { where: { pk: userPk } });

    return result.indexOf(1) > -1;
  }

  /**
   * @param  {string} tenancyId
   * @param  {string} tenancyMemberId
   * @returns Promise<TenancyMember>
   */
  public async findTenancyMemberById(tenancyId: string, tenancyMemberId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyMemberId)) throw new HttpException(400, 'TenancyMemberid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findOne({
      where: {
        id: tenancyMemberId,
        isDeleted: 0,
      },
      attributes: {
        exclude: ['pk', 'userPk', 'tenancyPk', 'isDeleted', 'invitedBy', 'verificationCode'],
      },
      include: [
        {
          model: DB.Tenancies,
          where: {
            id: tenancyId,
            isDeleted: 0,
          },
          attributes: [],
        },
      ],
    });
    if (!findTenancyMember) throw new HttpException(400, 'Tenancy member does not exist');
    return findTenancyMember;
  }

  public async updateTenancyMemberDetail(tenancyPk: number, updatedData): Promise<TenancyMember> {
    if (isEmpty(tenancyPk)) throw new HttpException(400, 'tenancyPk is required');
    const tenancyDetail: Tenancy = await this.tenancies.findByPk(tenancyPk);
    if (!tenancyDetail) throw new HttpException(400, "Tenancy doesn't exist");
    await this.user.update({ ...updatedData }, { where: { id: tenancyPk } });
    return;
  }
}

export default TenancyService;
