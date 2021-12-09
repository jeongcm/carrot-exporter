export interface TenancyMember {
    id: string,
    userName: string,
    userId: string,
    userRole:'owner' | 'member' | 'maintainer' ;;
    tenancyId: string,
    isActivated: boolean,
    invitedBy:string,
    verificationCode:string,
    isDeleted: boolean,
    tenancyLastAccess: Date,
    createdAt: Date,
    updatedAt: Date
}
