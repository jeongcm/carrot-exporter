export default async function getCostRelationCodeList(result, clusterUuid) {
  //API 결과변수
  const costRelationCodeQuery = {};

  const resourceType = 'CRC';
  let costRelationResult;

  let costRelationList = '';

  const costRelationCodeLength = result?.getCostRelationCodeListResponse?.costRelationCodeList?.length;
  for (let i = 0; i < costRelationCodeLength; i++) {
    costRelationResult = result?.getCostRelationCodeListResponse?.costRelationCodeList[i];
    costRelationCodeQuery['contract_type_code'] = costRelationResult.contractType.code;
    costRelationCodeQuery['contract_type_code_name'] = costRelationResult.contractType.codeName;
    costRelationCodeQuery['product_item_kind_code'] = costRelationResult.productItemKind.code;
    costRelationCodeQuery['product_item_kind_code_name'] = costRelationResult.productItemKind.codeName;
    costRelationCodeQuery['product_rating_type_code'] = costRelationResult.productRatingType.code;
    costRelationCodeQuery['product_rating_type_code_name'] = costRelationResult.productRatingType.codeName;
    costRelationCodeQuery['metering_type_code'] = costRelationResult.meteringType.code;
    costRelationCodeQuery['metering_type_code_name'] = costRelationResult.meteringType.codeName;
    costRelationCodeQuery['demand_type_code'] = costRelationResult.demandType.code;
    costRelationCodeQuery['demand_type_code_name'] = costRelationResult.demandType.codeName;
    costRelationCodeQuery['demand_type_detail_code'] = costRelationResult.demandTypeDetail.code;
    costRelationCodeQuery['demand_type_detail_code_name'] = costRelationResult.demandTypeDetail.codeName;
    costRelationCodeQuery['product_demand_type_code'] = costRelationResult.productDemandType.code;
    costRelationCodeQuery['product_demand_type_code_name'] = costRelationResult.productDemandType.codeName;

    costRelationList += JSON.stringify(costRelationCodeQuery);
    if (costRelationCodeLength > i + 1) {
      costRelationList += ',';
    }
  }
  const tempQuery = '{ "costRelationCodeList": [' + costRelationList + ']}';

  // console.log('tempQuery ::::::::::::::: \n' + tempQuery);
  return { message: tempQuery, resourceType: resourceType };
}
