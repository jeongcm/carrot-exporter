import DB from '@databases';
import { CreateTenancyDto } from '@dtos/tenancy.dto';
import { HttpException } from '@exceptions/HttpException';
import { Tenancy } from '@interfaces/tenancy.interface';
import { isEmpty } from '@utils/util';

class TenancyService {
  public tenancies = DB.Tenancies;

  public async findAllTenancy(): Promise<Tenancy[]> {
    const allUser: Tenancy[] = await this.tenancies.findAll({ where: { isDeleted: false } });
    return allUser;
  }

  public async findTenancyById(id: string): Promise<Tenancy> {
    if (isEmpty(id)) throw new HttpException(400, "Not a valid tenancy");

    const findTenancy: Tenancy = await this.tenancies.findByPk(id);
    if (!findTenancy) throw new HttpException(409, "Tenancy Not found");

    return findTenancy;
  }

  public async createTenancy(tenancyData: CreateTenancyDto): Promise<Tenancy> {
    if (isEmpty(tenancyData)) throw new HttpException(400, "Tenancy Data cannot be blank");
    let currentDate = new Date();
    let newTenancy = {
      tenancyCode: tenancyData.tenancyCode,
      tenancyDescription: tenancyData.tenancyDescription,
      tenancyName: tenancyData.tenancyName,
      createdBy: tenancyData.createdBy,
      updatedBy: tenancyData.updatedBy,
      updatedAt: tenancyData.updatedAt,
      createdAt: tenancyData.createdAt,
      isDeleted: tenancyData.isDeleted
    }
    const createTenancyData: Tenancy = await this.tenancies.create(newTenancy);
    return createTenancyData;
  }


  public async updateTenancy(tenancyId: string, tenancyData: CreateTenancyDto): Promise<Tenancy> {
    if (isEmpty(tenancyData)) throw new HttpException(400, "Tenancy Data cannot be blank");
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyId);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ ...tenancyData }, { where: { id: tenancyId } });
    const updateUser: Tenancy = await this.tenancies.findByPk(tenancyId);
    return updateUser;
  }

  public async deleteTenancy(tenancyId: string): Promise<Tenancy> {
    if (isEmpty(tenancyId)) throw new HttpException(400, "Tenancyid is required");
    const findTenancy: Tenancy = await this.tenancies.findByPk(tenancyId);
    if (!findTenancy) throw new HttpException(409, "Tenancy doesn't exist");
    await this.tenancies.update({ isDeleted: true }, { where: { id: tenancyId } });
    return findTenancy;
  }
}

export default TenancyService;