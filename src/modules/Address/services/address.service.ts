import _ from 'lodash';
import DB from '@/database';

import { IAddress } from '@/common/interfaces/address.interface';

import { HttpException } from '@/common/exceptions/HttpException';
import { isEmpty } from '@/common/utils/util';

import sequelize from 'sequelize';
import { Op } from 'sequelize';

import { CreateAddressDto } from '@/modules/Address/dtos/address.dto';

/**
 * @memberof Address
 */
class AddressService {
  public address = DB.Address;
  public custoemrAccountAdress = DB.CustomerAccountAddress;

  public async createAddress(addressData: CreateAddressDto, currentPartyUserPk: number): Promise<IAddress> {
    if (isEmpty(addressData)) throw new HttpException(400, 'Address must not be empty');

    const createdAddress: IAddress = await this.address.create({
      ...addressData,
      addressId: Date.now().toString(),
      createdBy: 'system',
    });

    return createdAddress;
  }
}

export default AddressService;
