import { TenancyModel } from '@/models/tenancy.model';
import { UserModel } from '@/models/users.model';
import DB from '@databases';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { CreateTenancyMemberDto } from '@dtos/tenancyMember.dto';
import { HttpException } from '@exceptions/HttpException';
import { Tenancy } from '@interfaces/tenancy.interface';
import { TenancyMember } from '@interfaces/tenancyMember.interface';
import { isEmpty } from '@utils/util';

class TenancyService {
  public tenancies = DB.Tenancies;
  public tenancyMember = DB.TenancyMembers;

  public async findAllTenancy(): Promise<Tenancy[]> {
    const allUser: Tenancy[] = await this.tenancies.findAll({ where: { isDeleted: false } });
    return allUser;
  }

  public async findTenancyById(id: string): Promise<Tenancy> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid tenancy');

    const findTenancy: Tenancy = await this.tenancies.findByPk(id);
    if (!findTenancy) throw new HttpException(409, 'Tenancy Not found');

    return findTenancy;
  }

  public async createTenancy(tenancyData: CreateTenancyDto): Promise<Tenancy> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');
    const currentDate = new Date();
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
    console.log('tenancyData', tenancyData);
    const newTenancy = {
      userName: tenancyData.userName,
      userId: tenancyData.userId,
      tenancyId: tenancyData.tenancyId,
      invitedBy: currentUserId,
      verificationCode: tenancyData.verificationCode,
      userRole: tenancyData.userRole,
      updatedAt: tenancyData.updatedAt,
      createdAt: tenancyData.createdAt,
      isDeleted: tenancyData.isDeleted,
      isActivated: tenancyData.isActivated,
    };
    console.log('newtenancy', newTenancy);
    const createTenancyData: TenancyMember = await this.tenancyMember.create(newTenancy);
    return createTenancyData;
  }

  public async findAllTenancyMembers(tenancyId: string): Promise<TenancyMember[]> {
    // const allTenancyMembers: TenancyMember[] = await this.tenancyMember.findAll({ where: { isDeleted: false, tenancyId } });

    const allTenancyMembers: TenancyMember[] = await this.tenancyMember.findAll({
      where: {
        tenancyId,
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

  public async updateTenancy(tenancyId: string, tenancyData: CreateTenancyDto): Promise<Tenancy> {
    if (isEmpty(tenancyData)) throw new HttpException(400, 'Tenancy Data cannot be blank');
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyId);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ ...tenancyData }, { where: { id: tenancyId } });
    const updateUser: Tenancy = await this.tenancies.findByPk(tenancyId);
    return updateUser;
  }

  public async deleteTenancy(tenancyId: string): Promise<Tenancy> {
    if (isEmpty(tenancyId)) throw new HttpException(400, 'Tenancyid is required');
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyId);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ isDeleted: true }, { where: { id: tenancyId } });
    return findTenancy;
  }
  public async deleteTenancyMember(tenancyId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyId)) throw new HttpException(400, 'Tenancyid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findOne({ where: { tenancyId, isDeleted: false } });
    if (!findTenancyMember) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancyMember.update({ isDeleted: true }, { where: { id: findTenancyMember.id } });
    return findTenancyMember;
  }
  public async findTenancyMember(tenancyMemberId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyMemberId)) throw new HttpException(400, 'TenancyMemberid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findByPk();
    if (!findTenancyMember) throw new HttpException(409, "Tenancy doesn't exist");
    return findTenancyMember;
  }

  public async updateTenancyMember(tenancyMemberData, tenancyMemberId: string): Promise<TenancyMember> {
    if (isEmpty(tenancyMemberId)) throw new HttpException(400, 'TenancyMemberid is required');
    const findTenancyMember: TenancyMember = await this.tenancyMember.findByPk();
    if (!findTenancyMember) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ ...tenancyMemberData }, { where: { id: tenancyMemberId } });
    return await this.tenancyMember.findByPk();
  }
}

export default TenancyService;
