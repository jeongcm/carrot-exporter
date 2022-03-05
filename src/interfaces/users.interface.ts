export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  mobile: string;
  photo: string;
  currentTenancyId:string;
  isEmailValidated:boolean;
  emailValidatedOn:Date;
  token:string;
  socialProviderId:string;
  lastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  email: string;
  password: string;
  username: string;
}


export interface CurrentUser {
  id: string;
  iat: number;
  exp: number
}

export interface CurrentTenancy {
  tenancyId: number;
}
