import DB from '@/database';
import { Log } from '@/common/interfaces/log.interface';
import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';
import { CreateLogDto } from '@/modules/Log/dtos/log.dto';

class LogService {
  public log = DB.Log;

  public async getAllLogs(): Promise<Log[]> {
    const allLogs: Log[] = await this.log.findAll({ order: [['createdAt', 'DESC']] });
    return allLogs;
  }

  public async getLogById(id: number): Promise<Log> {
    const log: Log = await this.log.findOne({ where: { id } });
    return log;
  }

  public async createLog(logData: CreateLogDto): Promise<Log> {
    if (isEmpty(logData)) throw new HttpException(400, 'Log must not be empty');

    const createLogData: Log = await this.log.create(logData);
    return createLogData;
  }

  public async updateLog(logId: string, logData: CreateLogDto, currentUserId: string): Promise<Log> {
    if (isEmpty(logData)) throw new HttpException(400, 'Log Data cannot be blank');
    const findLog: Log = await this.log.findByPk(logId);
    if (!findLog) throw new HttpException(409, "Log doesn't exist");
    const updatedLogData = {
      ...logData,
      updatedBy: currentUserId,
      updatedAt: new Date(),
    };
    await this.log.update(updatedLogData, { where: { id: logId } });
    const updateUser: Log = await this.log.findByPk(logId);
    return updateUser;
  }

  public async deleteLogById(id: number): Promise<void> {
    const log: void = await this.log.findByPk(id).then(log => log.destroy());
    return log;
  }
}

export default LogService;
