export default async function getContractDemandCostQuery(result, clusterUuid) {
  //API 결과변수
  const contractDemandCostQuery = {};
  const contractProductQuery = {};

  const resourceType = 'CDC';
  let contractDemandCostResult;
  let contractResult;
  let contractProductResult;

  let contractDemandCostList = '';
  let contractProductList = '';

  /* 
    ContractDemandCost > Contract > ContractProduct
        계약청구비용        계약        계약상품
  */

  const contractDemandCostLength = result?.getContractDemandCostListResponse?.contractDemandCostList?.length;
  for (let i = 0; i < contractDemandCostLength; i++) {
    contractDemandCostResult = result.getContractDemandCostListResponse?.contractDemandCostList[i];
    // contractDemandCostQuery['contract_demand_cost_sequence'] = contractDemandCostResult.contractDemandCostSequence;
    contractDemandCostQuery['contract_demand_cost_sequence'] = i;
    contractDemandCostQuery['member_no'] = contractDemandCostResult.memberNo;
    contractDemandCostQuery['region_code'] = contractDemandCostResult.regionCode;
    contractDemandCostQuery['demand_type_code'] = contractDemandCostResult.demandType.code;
    contractDemandCostQuery['demand_type_code_name'] = contractDemandCostResult.demandType.codeName;
    contractDemandCostQuery['demand_type_detail_code'] = contractDemandCostResult.demandTypeDetail.code;
    contractDemandCostQuery['demand_type_detail_code_name'] = contractDemandCostResult.demandTypeDetail.codeName;
    contractDemandCostQuery['contract_no'] = contractDemandCostResult.contractNo;
    contractDemandCostQuery['demand_month'] = contractDemandCostResult.demandMonth;
    contractDemandCostQuery['unit_usage_quantity'] = contractDemandCostResult.unitUsageQuantity;
    contractDemandCostQuery['package_unit_usage_quantity'] = contractDemandCostResult.packageUnitUsageQuantity;
    contractDemandCostQuery['total_unit_usage_quantity'] = contractDemandCostResult.totalUnitUsageQuantity;
    contractDemandCostQuery['usage_unit_code'] = contractDemandCostResult.usageUnit.code;
    contractDemandCostQuery['usage_unit_code_name'] = contractDemandCostResult.usageUnit.codeName;
    contractDemandCostQuery['product_price'] = contractDemandCostResult.productPrice;
    contractDemandCostQuery['use_amount'] = contractDemandCostResult.useAmount;
    contractDemandCostQuery['promotion_discount_amount'] = contractDemandCostResult.promotionDiscountAmount;
    contractDemandCostQuery['etc_discount_amount'] = contractDemandCostResult.etcDiscountAmount;
    contractDemandCostQuery['promise_discount_amount'] = contractDemandCostResult.promiseDiscountAmount;
    contractDemandCostQuery['demand_amount'] = contractDemandCostResult.demandAmount;
    contractDemandCostQuery['write_date'] = contractDemandCostResult.writeDate;
    contractDemandCostQuery['member_price_discount_amount'] = contractDemandCostResult.memberPriceDiscountAmount;
    contractDemandCostQuery['member_promise_discount_amount'] = contractDemandCostResult.memberPromiseDiscountAddAmount;
    contractDemandCostQuery['pay_currency_code'] = contractDemandCostResult.payCurrency.code;
    contractDemandCostQuery['pay_currency_code_name'] = contractDemandCostResult.payCurrency.codeName;
    contractDemandCostQuery['this_month_applied_exchange_rate'] = contractDemandCostResult.thisMonthAppliedExchangeRate;
    contractDemandCostQuery['contract_no'] = contractDemandCostResult.contract.contractNo;
    contractDemandCostQuery['contract_info'] = JSON.stringify(contractDemandCostResult.contract);

    contractDemandCostList += JSON.stringify(contractDemandCostQuery);

    if (contractDemandCostLength > i + 1) {
      contractDemandCostList += ',';
    }

    // for (let y = 0; y < contractDemandCostResult.contract.length; y++) {
    contractResult = contractDemandCostResult?.contract;

    for (let j = 0; j < contractResult.contractProductList?.length; j++) {
      contractProductResult = contractResult?.contractProductList[j];
      contractProductQuery['contract_product_sequence'] = parseInt(contractProductResult.contractProductSequence);
      contractProductQuery['before_contract_product_sequence'] = parseInt(contractProductResult.beforeContractProductSequence);
      contractProductQuery['contract_demand_cost_sequence'] = i;
      contractProductQuery['demand_month'] = contractDemandCostResult.demandMonth;
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
    }
  }
  //TODO 하위 List 가공 후 맨 마지막 쉼표 제거, 추후 다른 방식 생기면 수정
  //contractList = contractList.substring(0, contractList.length - 1);
  contractProductList = contractProductList.substring(0, contractProductList.length - 1);

  const tempQuery = '{ "contractDemandCostList": [' + contractDemandCostList + '],' + '"contractProductList": [' + contractProductList + ']}';

  // console.log('tempQuery :: \n' + tempQuery);

  return { message: tempQuery, resourceType: resourceType };
}
