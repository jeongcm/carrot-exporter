export default async function getContractUsageQuery(result, clusterUuid) {
  //API 결과변수
  const contractQuery = {};
  const contractProductQuery = {};
  const usageQuery = {};

  const resourceType = 'CU';
  let usageResult;
  let contractResult;
  let contractProductResult;

  let contractList = '';
  let contractProductList = '';
  let usageList = '';

  /* 
    Contract > ContractProduct > Usage
      계약        계약 상품       사용량
  */
  const contractLength = result?.getContractUsageListResponse?.contractList?.length;
  for (let i = 0; i < contractLength; i++) {
    contractResult = result?.getContractUsageListResponse?.contractList[i];
    contractQuery['member_no'] = contractResult.memberNo;
    contractQuery['contract_no'] = contractResult.contractNo;
    contractQuery['conjunction_contract_no'] = contractResult.conjunctionContractNo;
    contractQuery['contract_type_code'] = contractResult.contractType.code;
    contractQuery['contract_type_code_name'] = contractResult.contractType.codeName;
    contractQuery['contract_status_code'] = contractResult.contractStatus.code;
    contractQuery['contract_status_code_name'] = contractResult.contractStatus.codeName;
    contractQuery['contract_start_date'] = contractResult.contractStartDate;
    contractQuery['contract_end_date'] = contractResult.contractEndDate;
    contractQuery['instance_name'] = contractResult.instanceName;
    contractQuery['region_code'] = contractResult.regionCode;
    contractQuery['platform_type_code'] = contractResult.platformType.code;
    contractQuery['platform_type_code_name'] = contractResult.platformType.codeName;

    contractList += JSON.stringify(contractQuery);
    if (contractLength > i + 1) {
      contractList += ',';
    }

    //console.log('계약 목록 cnt: ' + contractDemandCostResult[i]?.contractList.length);
    // if (JSON.stringify(contractDemandCostResult.contract) !== '{}') {
    for (let j = 0; j < contractResult.contractProductList?.length; j++) {
      contractProductResult = contractResult?.contractProductList[j];
      contractProductQuery['contract_product_sequence'] = contractProductResult.contractProductSequence;
      if ('' === contractProductResult.beforeContractProductSequence) {
        contractProductResult.beforeContractProductSequence = null;
      }
      contractProductQuery['before_contract_product_sequence'] = contractProductResult.beforeContractProductSequence;
      contractProductQuery['product_code'] = contractProductResult.productCode;
      contractProductQuery['price_no'] = contractProductResult.priceNo;
      contractProductQuery['promise_no'] = contractProductResult.promiseNo;
      contractProductQuery['instance_no'] = contractProductResult.instanceNo;
      contractProductQuery['product_item_kind_code'] = contractProductResult.productItemKind.code;
      contractProductQuery['product_item_kind_code_name'] = contractProductResult.productItemKind.codeName;
      contractProductQuery['product_rating_type_code'] = contractProductResult.productRatingType.code;
      contractProductQuery['product_rating_type_code_name'] = contractProductResult.productRatingType.codeName;
      contractProductQuery['service_status_code'] = contractProductResult.serviceStatus.code;
      contractProductQuery['service_status_code_name'] = contractProductResult.serviceStatus.codeName;
      contractProductQuery['service_start_date'] = contractProductResult.serviceStartDate;
      contractProductQuery['service_end_date'] = contractProductResult.serviceEndDate;
      contractProductQuery['product_size'] = contractProductResult.productSize;
      contractProductQuery['product_count'] = contractProductResult.productCount;

      //계약번호는 계약 List에서 추출
      contractProductQuery['contract_no'] = contractResult.contractNo;

      contractProductList += JSON.stringify(contractProductQuery);

      contractProductList += ',';

      for (let y = 0; y < contractProductResult?.usageList.length; y++) {
        usageResult = contractProductResult?.usageList[y];
        usageQuery['metering_type_code'] = usageResult.meteringType.code;
        usageQuery['metering_type_code_name'] = usageResult.meteringType.codeName;
        usageQuery['use_month'] = usageResult.useMonth;
        usageQuery['usage_quantity'] = usageResult.usageQuantity;
        usageQuery['unit_code'] = usageResult.unit.code;
        usageQuery['unit_code_name'] = usageResult.unit.codeName;
        usageQuery['user_usage_quantity'] = usageResult.userUsageQuantity;
        usageQuery['user_unit_code'] = usageResult.userUnit.code;
        usageQuery['user_unit_code_name'] = usageResult.userUnit.codeName;

        usageQuery['contract_no'] = contractResult.contractNo;
        usageQuery['contract_product_sequence'] = contractProductResult.contractProductSequence;

        usageList += JSON.stringify(usageQuery);

        usageList += ',';
      }
    }
  }

  //TODO 하위 List 가공 후 맨 마지막 쉼표 제거, 추후 다른 방식 생기면 수정
  contractProductList = contractProductList.substring(0, contractProductList.length - 1);
  usageList = usageList.substring(0, usageList.length - 1);

  const tempQuery =
    '{ "contractList": [' + contractList + '],' + '"contractProductList": [' + contractProductList + '], "usageList": [' + usageList + ']}';

  // console.log('tempQuery ::::::::::::::: \n' + tempQuery);
  return { message: tempQuery, resourceType: resourceType, clusterUuid: clusterUuid };
}
