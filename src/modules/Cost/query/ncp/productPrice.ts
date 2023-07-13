export default async function getProductPriceQuery(result, clusterUuid) {
  //API 결과변수
  const productPriceQuery = {};
  const priceQuery = {};

  const resourceType = 'PP';
  let productPriceResult;
  let priceResult;

  let productPriceList = '';
  let priceList = '';

  /* 
    Product > Price 
      상품     가격
  */

  const productPriceLength = result?.getProductPriceListResponse?.productPriceList?.length;
  for (let i = 0; i < productPriceLength; i++) {
    productPriceResult = result.getProductPriceListResponse?.productPriceList[i];
    productPriceQuery['product_item_kind_code'] = productPriceResult.productItemKind.code;
    productPriceQuery['product_item_kind_code_name'] = productPriceResult.productItemKind.codeName;
    productPriceQuery['product_item_kind_detail_code'] = productPriceResult.productItemKindDetail.code;
    productPriceQuery['product_item_kind_detail_code_name'] = productPriceResult.productItemKindDetail.codeName;

    //TODO 코드 관련 컬럼,. 필수값인데 오지 않아서 따로 처리, 문의 답변 후 수정 2023.05.23
    if (productPriceResult.hasOwnProperty('productType')) {
      productPriceQuery['product_type_code'] = productPriceResult.productType.code;
      productPriceQuery['product_type_code_name'] = productPriceResult.productType.codeName;
    }
    productPriceQuery['product_code'] = productPriceResult.productCode;
    productPriceQuery['product_name'] = productPriceResult.productName;
    productPriceQuery['product_description'] = productPriceResult.productDescription;
    productPriceQuery['software_type_code'] = productPriceResult.softwareType.code;
    productPriceQuery['software_type_code_name'] = productPriceResult.softwareType.codeName;
    productPriceQuery['gpu_count'] = productPriceResult.gpuCount;
    productPriceQuery['cpu_count'] = productPriceResult.cpuCount;
    productPriceQuery['memory_size'] = productPriceResult.memorySize;
    productPriceQuery['base_block_storage_size'] = productPriceResult.baseBlockStorageSize;
    if (productPriceResult.hasOwnProperty('dbKind')) {
      productPriceQuery['db_kind_code'] = productPriceResult.dbKind.code;
      productPriceQuery['db_kind_code_name'] = productPriceResult.dbKind.codeName;
    }
    productPriceQuery['os_information'] = productPriceResult.osInfomation;
    if (productPriceResult.hasOwnProperty('platformType')) {
      productPriceQuery['platform_type_code'] = productPriceResult.platformType.code;
      productPriceQuery['platform_type_code_name'] = productPriceResult.platformType.codeName;
    }
    productPriceQuery['os_type_code'] = productPriceResult.osType.code;
    productPriceQuery['os_type_code_name'] = productPriceResult.osType.codeName;
    productPriceQuery['platform_category_code'] = productPriceResult.platformCategoryCode;
    productPriceQuery['disk_type_code'] = productPriceResult.diskType.code;
    productPriceQuery['disk_type_code_name'] = productPriceResult.diskType.codeName;
    productPriceQuery['disk_detail_type_code'] = productPriceResult.diskDetailType.code;
    productPriceQuery['disk_detail_type_code_name'] = productPriceResult.diskDetailType.codeName;
    productPriceQuery['generation_code'] = productPriceResult.generationCode;

    productPriceList += JSON.stringify(productPriceQuery);
    if (productPriceLength > i + 1) {
      productPriceList += ',';
    }

    if ('{}' !== JSON.stringify(productPriceResult.priceList)) {
      priceResult = productPriceResult?.priceList;
      for (let j = 0; j < productPriceResult.priceList?.length; j++) {
        priceResult = productPriceResult?.priceList[j];
        priceQuery['product_code'] = productPriceResult.productCode;
        priceQuery['price_no'] = priceResult.priceNo;
        priceQuery['price_type_code'] = priceResult.priceType.code;
        priceQuery['price_type_code_name'] = priceResult.priceType.codeName;
        priceQuery['region'] = JSON.stringify(priceResult.region);
        if (priceResult.hasOwnProperty('chargingUnitType')) {
          priceQuery['charging_unit_type_code'] = priceResult.chargingUnitType.code;
          priceQuery['charging_unit_type_code_name'] = priceResult.chargingUnitType.codeName;
        }

        priceQuery['rating_unit_type_code'] = priceResult.ratingUnitType.code;
        priceQuery['rating_unit_type_code_name'] = priceResult.ratingUnitType.codeName;
        priceQuery['charging_unit_basic_value'] = priceResult.chargingUnitBasicValue;
        if (priceResult.hasOwnProperty('productRatingType')) {
          priceQuery['product_rating_type_code'] = priceResult.productRatingType.code;
          priceQuery['product_rating_type_code_name'] = priceResult.productRatingType.codeName;
        }
        if (priceResult.hasOwnProperty('unit')) {
          priceQuery['unit_code'] = priceResult.unit.code;
          priceQuery['unit_code_name'] = priceResult.unit.codeName;
        }
        priceQuery['price'] = priceResult.price;
        priceQuery['promise_list'] = JSON.stringify(priceResult.promiseList);
        priceQuery['condition_type_code'] = priceResult.conditionType.code;
        priceQuery['condition_type_code_name'] = priceResult.conditionType.codeName;
        priceQuery['condition_price'] = priceResult.conditionPrice;
        priceQuery['price_description'] = priceResult.priceDescription;
        priceQuery['free_unit_code'] = priceResult.freeUnit.code;
        priceQuery['free_unit_code_name'] = priceResult.freeUnit.codeName;
        priceQuery['free_value'] = priceResult.freeValue;
        if (priceResult.hasOwnProperty('meteringUnit')) {
          priceQuery['metering_unit_code'] = priceResult.meteringUnit.code;
          priceQuery['metering_unit_code_name'] = priceResult.meteringUnit.codeName;
        }
        priceQuery['start_date'] = formatIso8601(priceResult.startDate);
        if (priceResult.hasOwnProperty('priceAttribute')) {
          priceQuery['price_attribute_code'] = priceResult.priceAttribute.code;
          priceQuery['price_attribute_code_name'] = priceResult.priceAttribute.codeName;
        }

        priceQuery['price_version_name'] = priceResult.priceVersionName;
        priceQuery['pay_currency_code'] = priceResult.payCurrency.code;
        priceQuery['pay_currency_code_name'] = priceResult.payCurrency.codeName;
        priceQuery['period_unit_list'] = JSON.stringify(priceResult.periodUnitList);
        priceQuery['country_unit_list'] = JSON.stringify(priceResult.countryUnitList);
        priceQuery['package_unit_list'] = JSON.stringify(priceResult.packageUnitList);

        priceList += JSON.stringify(priceQuery);
        priceList += ',';
      }
    }
  }
  //TODO 하위 List 가공 후 맨 마지막 쉼표 제거, 추후 다른 방식 생기면 수정
  priceList = priceList.substring(0, priceList.length - 1);

  const productPrice = '{ "productPriceList": [' + productPriceList + ']}'
  const price = '{"priceList": [' + priceList + ']}'

  return { productPriceList: productPrice, priceList: price, resourceType: resourceType, clusterUuid: clusterUuid };
}

const formatIso8601 = (isoDate: Date) => {

  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return formattedDate
}
