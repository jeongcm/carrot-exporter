import _ from 'lodash';
import DB from '@/database';

import { IAddress } from '@/common/interfaces/address.interface';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import sequelize from 'sequelize';
import { Op } from 'sequelize';

import { CreateAddressDto } from '@/modules/Address/dtos/address.dto';
import tableIdService from '@/modules/CommonService/services/tableId.service';
import { IResponseIssueTableIdDto } from '@/modules/CommonService/dtos/tableId.dto';

/**
 * @memberof Address
 */
class AddressService {
  public address = DB.Address;
  public custoemrAccountAdress = DB.CustomerAccountAddress;
  public tableIdService = new tableIdService();

  public async createAddress(addressData: CreateAddressDto, logginedUserId: string): Promise<IAddress> {
    if (isEmpty(addressData)) throw new HttpException(400, 'Address must not be empty');

    try {
      const tableIdTableName = 'Address';
      const tableId = await this.tableIdService.getTableIdByTableName(tableIdTableName);

      if (!tableId) {
        return;
      }

      const responseTableIdData: IResponseIssueTableIdDto = await this.tableIdService.issueTableId(tableIdTableName);

      const createdAddress: IAddress = await this.address.create({
        ...addressData,
        addressId: responseTableIdData.tableIdFinalIssued,
        createdBy: logginedUserId,
      });

      return createdAddress;
    } catch (error) {}
  }
}

export default AddressService;
