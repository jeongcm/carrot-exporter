import ServiceExtension from '@/common/extentions/service.extension';
import { IParty, PartyChannel } from '@/common/interfaces/party.interface';
import DB from '@/database';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';
import { ChannelModel } from '@/modules/Messaging/models/channel.model';
import { Channel } from 'diagnostics_channel';
import { AddChannelToAccessGroupDto } from '../dtos/partychannel.dto';
import { Op } from 'sequelize';

class PartyChannelService extends ServiceExtension {
  public partyChannel = DB.PartyChannel;

  constructor() {
    super({
      tableName: 'PartyChannel',
    });
  }

  /**
   * @param  {number} partyKey
   * @returns Promise
   */
  public async getPartyChannelKey(partyKey: number): Promise<number> {
    try {
      const partyChannelKeyData: PartyChannel = await this.partyChannel.findOne({ where: { partyKey } });
      return partyChannelKeyData.partyChannelKey;
    } catch (error) {}
  }

  /**
   * * Get channels of accessgroup.
   *
   * @returns Promise<PartyChannel[]>
   */
  public async getChannelOfAccessGroup(partyKey: number): Promise<PartyChannel[]> {
    const allPartyChannel: PartyChannel[] = await this.partyChannel.findAll({
      where: { partyKey, deletedAt: null },
      include: {
        model: ChannelModel,
        attributes: { exclude: ['channelKey', 'customerAccountKey', 'deletedAt', 'partyChannelKey', 'partyKey'] },
      },
    });

    return allPartyChannel;
  }

  /**
   * Add channels to accessgroup.
   *
   * @param  {AddChannelToAccessGroupDto} partyChannelData
   * @returns Promise<PartyChannel[]>
   * @author saemsol
   */
  public async addChannelToAccessGroup(logginedUserId: string, partyKey: number, channelKeys: number[]): Promise<PartyChannel[]> {
    const insertDataList = [];

    for (const channelKey of channelKeys) {
      const newPartyChannelId: string = await this.createTableId();
      const currentDate = new Date();

      insertDataList.push({
        PartychannelId: newPartyChannelId,
        partyKey,
        channelKey,
        createdBy: logginedUserId,
        partyChannelFrom: currentDate,
        partyChannelTo: currentDate,
        partyChannelDefault: false,
      });
    }

    return await this.partyChannel.bulkCreate(insertDataList, { returning: true });
  }

  public async removeChannelFromAccessGroup(logginedUserId: string, partyKey: number, channelKeys: number[]): Promise<[number]> {
    const currentDate = new Date();

    const updated: [number] = await this.partyChannel.update(
      { deletedAt: currentDate, updatedBy: logginedUserId, partyChannelTo: currentDate },
      {
        where: {
          partyKey,
          channelKey: { [Op.in]: channelKeys },
          deletedAt: null,
        },
      },
    );

    return updated;
  }
}
export default PartyChannelService;
