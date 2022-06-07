import { PartyChannel } from '@/common/interfaces/party.interface';
import DB from '@/database';
import { Channel } from 'diagnostics_channel';
import { CreatePartyChannel } from '../dtos/partychannel.dto';

class PartyChannelService {
  public partyChannel = DB.PartyChannel;
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
   * @returns Promise<PartyChannel[]>
   */
  public async findAllChannel(): Promise<PartyChannel[]> {
    const allPartyChannel: PartyChannel[] = await this.partyChannel.findAll({
      where: { deletedAt: null },
    });
    return allPartyChannel;
  }
  /**
   * Create a new PartyChannel
   *
   * @param  {CreatePartyChannel} partyChannelData
   * @returns Promise<PartyChannel>
   * @author Akshay
   */
  public async createPartyChannel(
    partyKey: number,
    channelKey: number,
    tempPartyChannelId: string,
    customerAccountKey: number,
  ): Promise<PartyChannel> {
    const currentDate = new Date();
    const newPartyChannel = {
      partyKey: partyKey,
      channelKey: channelKey,
      PartychannelId: tempPartyChannelId,
      createdBy: customerAccountKey.toLocaleString(),
      updatedBy: customerAccountKey.toLocaleString(),
      deletedAt: null,
      updatedAt: currentDate,
      partyChannelFrom: currentDate,
      partyChannelTo: currentDate,
      partyChannelDefault: false,
    };
    const createPartyChannel: PartyChannel = await this.partyChannel.create(newPartyChannel);
    return createPartyChannel;
  }
}
export default PartyChannelService;
