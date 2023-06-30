export default async function getDemandCostQuery(result, clusterUuid) {
  //API 결과변수
  const demandCostQuery = {};

  const resourceType = 'DC';
  let demandCostResult;

  let demadCostList = '';

  const demandCostLength = result?.getDemandCostListResponse?.demandCostList?.length;
  for (let i = 0; i < demandCostLength; i++) {
    demandCostResult = result?.getDemandCostListResponse?.demandCostList[i];
    demandCostQuery['member_no'] = demandCostResult.memberNo;
    demandCostQuery['demand_month'] = demandCostResult.demandMonth;
    demandCostQuery['demand_no'] = demandCostResult.demandNo;
    demandCostQuery['integration_demand_no'] = demandCostResult.integrationDemandNo;
    demandCostQuery['demand_attribute_code'] = demandCostResult.demandAttribute.code;
    demandCostQuery['demand_attribute_code_name'] = demandCostResult.demandAttribute.codeName;
    demandCostQuery['use_amount'] = demandCostResult.useAmount;
    demandCostQuery['promise_discount_amount'] = demandCostResult.promiseDiscountAmount;
    demandCostQuery['etc_discount_amount'] = demandCostResult.etcDiscountAmount;
    demandCostQuery['customer_discount_amount'] = demandCostResult.customerDiscountAmount;
    demandCostQuery['product_discount_amount'] = demandCostResult.productDiscountAmount;
    demandCostQuery['credit_discount_amount'] = demandCostResult.creditDiscountAmount;
    demandCostQuery['rounddown_discount_amount'] = demandCostResult.rounddownDiscountAmount;
    demandCostQuery['currency_discount_amount'] = demandCostResult.currencyDiscountAmount;
    demandCostQuery['coin_use_amount'] = demandCostResult.coinUseAmount;
    demandCostQuery['default_amount'] = demandCostResult.defaultAmount;
    demandCostQuery['this_month_demand_amount'] = demandCostResult.thisMonthDemandAmount;
    demandCostQuery['this_month_vat_ratio'] = demandCostResult.thisMonthVatRatio;
    demandCostQuery['this_month_vat_amount'] = demandCostResult.thisMonthVatAmount;
    demandCostQuery['this_month_amount_including_vat'] = demandCostResult.thisMonthAmountIncludingVat;
    demandCostQuery['total_demand_amount'] = demandCostResult.totalDemandAmount;
    demandCostQuery['is_paid_up'] = demandCostResult.isPaidUp;
    demandCostQuery['paid_up_date'] = demandCostResult.paidUpDate;
    // demandCostQuery['overdue_occur_date'] = demandCostResult.overdueOccurDate;
    demandCostQuery['overdue_plus_amount'] = demandCostResult.overduePlusAmount;
    demandCostQuery['overdue_ratio'] = demandCostResult.overdueRatio;
    demandCostQuery['this_month_overdue_amount'] = demandCostResult.thisMonthOverdueAmount;
    demandCostQuery['before_month_demand_no'] = demandCostResult.beforeMonthDemandNo;
    demandCostQuery['total_overdue_amount'] = demandCostResult.totalOverdueAmount;
    demandCostQuery['write_date'] = demandCostResult.writeDate;
    demandCostQuery['member_price_discount_amount'] = demandCostResult.memberPriceDiscountAmount;
    demandCostQuery['member_promise_discount_add_amount'] = demandCostResult.memberPromiseDiscountAddAmount;
    demandCostQuery['pay_currency_code'] = demandCostResult.payCurrency.code;
    demandCostQuery['pay_currency_code_name'] = demandCostResult.payCurrency.codeName;
    demandCostQuery['this_month_applied_exchange_rate'] = demandCostResult.thisMonthAppliedExchangeRate;
    demandCostQuery['promotion_discount_amount'] = demandCostResult.promotionDiscountAmount;

    demadCostList += JSON.stringify(demandCostQuery);
    if (demandCostLength > i + 1) {
      demadCostList += ',';
    }
  }
  const tempQuery = '{ "demandCostList": [' + demadCostList + ']}';

  // console.log('tempQuery ::::::::::::::: \n' + tempQuery);
  return { message: tempQuery, resourceType: resourceType, clusterUuid: clusterUuid};
}
