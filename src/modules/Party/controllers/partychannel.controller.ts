import { IRequestWithUser, PartyChannel } from "@/common/interfaces/party.interface";
import { IResponseIssueTableIdDto } from "@/modules/CommonService/dtos/tableId.dto";
import TableIdService from "@/modules/CommonService/services/tableId.service";
import ChannelService from "@/modules/Messaging/services/channel.service";
import { NextFunction, Response } from "express";
import PartyChannelService from "../services/partychannel.service";

class PartyChannelController {
    public partyChannelService = new PartyChannelService();
    public channelService = new ChannelService();
    public tableIdService = new TableIdService();
    public createPartyChannel = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
        try {
            const customerAccountKey:number = req.customerAccountKey
            const tempPartyKey: number = req.user.partyKey;
            const partyChannelData = req.body;
            if (!await this.channelService.isValidChannelKey(partyChannelData.channelKey)){
                res.status(404).json({ data: "Not able to create party Channel", message: 'not created' });
            }
            const tableIdName: string = "PartyChannel";
            const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdName);
            const tempPartyChannelId: string = responseTableIdData.tableIdFinalIssued;
            const createPartyChannelData: PartyChannel = await this.partyChannelService.createPartyChannel(tempPartyKey,partyChannelData,tempPartyChannelId,customerAccountKey);
            res.status(201).json({ data: createPartyChannelData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };
}

export default PartyChannelController;