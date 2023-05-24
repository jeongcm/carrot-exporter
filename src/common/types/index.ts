export type ResourceType =
  | 'K8'
  | 'ND'
  | 'PD'
  | 'NS'
  | 'SV'
  | 'OS'
  | 'PM'
  | 'PJ'
  | 'VM'
  | 'CT'
  | 'DP'
  | 'SS'
  | 'DS'
  | 'RS'
  | 'PV'
  | 'PC'
  | 'SE'
  | 'EP'
  | 'CM'
  | 'IG'
  | 'SC'
  | 'JO'
  | 'CJ'
  | 'EV'
  | 'NCP'
  | 'RG'
  | 'VPC'
  | 'SBN'
  | 'ACL'
  | 'RT'
  | 'LB'
  | 'TG'
  | 'NET'
  | 'ACG'
  | 'PIP'
  | 'BLS'
  | 'SIMG'
  | 'PLG'
  | 'INS'
  | 'DBMYQL'
  | 'DBPOQL'
  | 'DBMONG'
  | 'DBMSQL'
  | 'DBREDS'
  | 'NAS'
  | 'NASSS'
  | 'OBS'
  | 'NKS'
  | 'NKSNP'
  | 'NKSWN'

export type ResourceTypeLevel1 = 'K8' | 'OS' | 'NCP';

export type ResourceTypeLevel2 = 'ND' | 'NS' | 'PJ' | 'PV' | 'SC' | 'DP' | 'SS' | 'DS' | 'RS' | 'PC' | 'SE' | 'EP' | 'CM' | 'IG' | 'JO' | 'CJ' | 'EV' | 'PM' | 'RG';

export type ResourceTypeLevel3 = 'ND' | 'NS' | 'VM' | 'PV' | 'SC' | 'DP' | 'SS' | 'DS' | 'RS' | 'PC' | 'SE' | 'EP' | 'CM' | 'IG' | 'JO' | 'CJ' | 'EV' | 'VPC';

export type ResourceTypeLevel4 = 'WL' | 'SBN' | 'ACL' | 'RT' | 'LB' | 'TG';

export type ResourceTypeLevel5 = 'VM' | 'NET' | 'ACG' | 'PIP' | 'BLS' | 'SS' | 'SIMG' | 'PLG' | 'INS' | 'DBMYQL' | 'DBPOQL' | 'DBMONG' | 'DBMSQL' | 'DBREDS' | 'NAS' | 'NASSS' | 'OBS' | 'NKS' | 'NKSNP' | 'NKSWN';

