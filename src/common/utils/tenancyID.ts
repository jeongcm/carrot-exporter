import { CurrentTenancy } from '@/common/interfaces/users.interface';
/**
 * @param  {} req
 * @returns currentTenancyId
 */
export const tenancyId = (req): CurrentTenancy => {
  const currentTenancyId = req.headers['tenancyId'];
  if (currentTenancyId) {
    const CurrentTenancy: CurrentTenancy = {
      tenancyId: currentTenancyId,
    };
    return CurrentTenancy;
  }
};
