import { User } from '@/common/interfaces/users.interface';
import { UserModel } from '@/modules/UserTenancy/models/users.model';
import DB from '@/database';
import { CreateTenancyDto } from '@/modules/UserTenancy/dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@/modules/UserTenancy/dtos/tenancyMember.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { Tenancy } from '@/common/interfaces/tenancy.interface';
import { TenancyMember } from '@/common/interfaces/tenancyMember.interface';
import { isEmpty } from '@/common/utils/util';

class TenancyService {
  public tenancies = DB.Tenancies;
  public tenancyMember = DB.TenancyMembers;
  public user = DB.Users;

  public async findAllTenancy(): Promise<Tenancy[]> {
    const allUser: Tenancy[] = await this.tenancies.findAll({ where: { isDeleted: false } });
    return allUser;
  }

  public async findTenancyById(id: number): Promise<Tenancy> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid tenancy');

    const findTenancy: Tenancy = await this.tenancies.findByPk(id);
    if (!findTenancy) throw new HttpException(409, 'Tenancy Not found');

    return findTenancy;
  }

  public async createTenancy(tenancyData: CreateTenancyDto): Promise<Tenancy> {
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
    const createTenancyData: Tenancy = await this.tenancies.create(newTenancy);
    return createTenancyData;
  }

  public async createTenancyMember(tenancyData: CreateTenancyMemberDto, currentUserId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');
    const newTenancy = {
      userName: tenancyData.userName,
      userPk: tenancyData.userPk,
      tenancyPk: tenancyData.tenancyPk,
      invitedBy: currentUserId,
      verificationCode: tenancyData.verificationCode,
      userRole: tenancyData.userRole,
      updatedAt: tenancyData.updatedAt,
      createdAt: tenancyData.createdAt,
      isDeleted: tenancyData.isDeleted,
      isActivated: tenancyData.isActivated,
    };
    const createTenancyData: TenancyMember = await this.tenancyMember.create(newTenancy);
    return createTenancyData;
  }

  public async findAllTenancyMembers(tenancyPk: number): Promise<TenancyMember[]> {
    // const allTenancyMembers: TenancyMember[] = await this.tenancyMember.findAll({ where: { isDeleted: false, tenancyPk } });

    const allTenancyMembers: TenancyMember[] = await this.tenancyMember.findAll({
      where: {
        tenancyPk,
      },
      // attributes: {
      //     exclude: ['createdAt', 'updatedAt']
      // },
      include: [
        {
          model: UserModel,
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
    });

    return allTenancyMembers;
  }

  public async updateTenancy(tenancyPk: number, tenancyData: CreateTenancyDto): Promise<Tenancy> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyPk);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ ...tenancyData }, { where: { id: tenancyPk } });
    const updateUser: Tenancy = await this.tenancies.findByPk(tenancyPk);
    return updateUser;
  }

  public async deleteTenancy(tenancyPk: number): Promise<Tenancy> {
    if (isEmpty(tenancyPk)) throw new HttpException(400, 'Tenancyid is required');
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyPk);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ isDeleted: true }, { where: { id: tenancyPk } });
    return findTenancy;
  }
  public async deleteTenancyMember(tenancyPk: number): Promise<TenancyMember> {
    if (isEmpty(tenancyPk)) throw new HttpException(400, 'Tenancyid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findOne({ where: { tenancyPk, isDeleted: false } });
    if (!findTenancyMember) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancyMember.update({ isDeleted: true }, { where: { id: findTenancyMember.id } });
    return findTenancyMember;
  }
  public async findTenancyMember(tenancyMemberId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyMemberId)) throw new HttpException(400, 'TenancyMemberid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findByPk(tenancyMemberId);
    if (!findTenancyMember) throw new HttpException(409, "Tenancy doesn't exist");
    return findTenancyMember;
  }

  public async updateTenancyMemberToUser(userPk, tenancyPk: number): Promise<TenancyMember> {
    if (isEmpty(tenancyPk)) throw new HttpException(400, 'tenancyPk is required');
    const userDetail: User = await this.user.findByPk(userPk);
    const tenancyDetail: Tenancy = await this.tenancies.findByPk(tenancyPk);
    if (!userDetail) throw new HttpException(409, "User doesn't exist");
    if (!tenancyDetail) throw new HttpException(409, "Tenancy doesn't exist");
    await this.user.update({ currentTenancyPk: tenancyPk }, { where: { id: userPk } });
    return;
  }

  public async updateTenancyMemberDetail(tenancyPk: number, updatedData): Promise<TenancyMember> {
    if (isEmpty(tenancyPk)) throw new HttpException(400, 'tenancyPk is required');
    const tenancyDetail: Tenancy = await this.tenancies.findByPk(tenancyPk);
    if (!tenancyDetail) throw new HttpException(409, "Tenancy doesn't exist");
    await this.user.update({ ...updatedData }, { where: { id: tenancyPk } });
    return;
  }

}

export default TenancyService;
