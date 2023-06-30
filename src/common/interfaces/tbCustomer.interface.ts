export interface ITbCustomer {
  customerUuid: string;
  customerName: string;
  contractStartDate: Date;
  contractEndDate: Date;
  businessRegistrationNumber: string;
  representativeName: string;
  representativeTel: string;
  representativeEmail: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  description: string;
  ncCustomerAccountKey: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
