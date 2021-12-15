import { CurrentTenancy } from '@/interfaces/users.interface';

export const tenancyId = (req): CurrentTenancy => {
  const currentTenancyId = req.headers['tenancyId'];
  if (currentTenancyId) {
    const CurrentTenancy: CurrentTenancy = {
      tenancyId: currentTenancyId,
    };
    return CurrentTenancy;
  }
};
