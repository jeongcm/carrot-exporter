import {
  PartyChannel
} from '@/common/interfaces/party.interface';
import DB from '@/database';
import { CreatePartyChannel } from '../dtos/partychannel.dto';

class PartyChannelService {
  public partyChannel = DB.PartyChannel

  public async getPartyChannelKey(partyKey: number): Promise<number> {
    try {
      const partyChannelKeyData: PartyChannel = await this.partyChannel.findOne({ where: { partyKey } });
      return partyChannelKeyData.partyChannelKey
    } catch (error) {}

  }
  /**
 * Create a new PartyChannel
 *
 * @param  {CreatePartyChannel} partyChannelData
 * @returns Promise<PartyChannel>
 * @author Akshay
 */
  public async createPartyChannel(tempPartyKey: number, partyChannelData: CreatePartyChannel, tempPartyChannelId: string, customerAccountKey: number): Promise<PartyChannel> {
    const currentDate = new Date();
    const newPartyChannel = {
      partyKey: tempPartyKey,
      channelKey: partyChannelData.channelKey,
      PartychannelId: tempPartyChannelId,
      createdBy: customerAccountKey.toLocaleString(),
      updatedBy: customerAccountKey.toLocaleString(),
      deletedAt: null,
      updatedAt: currentDate,
      isDeleted: false,
      partyChannelFrom: currentDate,
      partyChannelTo: currentDate,
      partyChannelDefault: false,
    };
    const createPartyChannel: PartyChannel = await this.partyChannel.create(newPartyChannel);
    return createPartyChannel;
  }
}
export default PartyChannelService;