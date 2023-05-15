export interface IContractDemandCost {
  contract_demand_cost_sequence: number;
  member_no: string;
  region_code: string;
  demand_type_code: string;
  demand_type_code_name: string;
  demand_type_detail_code: string;
  demand_type_detail_code_name: string;
  contract_no: string;
  demand_month: string;
  unit_usage_quantity: number;
  package_unit_usage_quantity: number;
  total_unit_usage_quantity: number;
  usage_unit_code: string;
  usage_unit_code_name: string;
  product_price: number;
  use_amount: number;
  promotion_discount_amount: number;
  etc_discount_amount: number;
  promise_discount_amount: number;
  demand_amount: number;
  write_date: Date;
  member_price_discount_amount: number;
  member_promise_discount_amount: number;
  pay_currency_code: string;
  pay_currency_code_name: string;
  this_month_applied_exchange_rate: number;
}
[];

export interface IContract {
  member_no: string;
  contract_no: string;
  contract_type_code: string;
  contract_type_code_name: string;
  conjunction_contract_no: string;
  contract_status_code: string;
  contract_status_code_name: string;
  contract_start_date: string;
  contract_end_date: string;
  instance_name: string;
  region_code: string;
  platform_type_code: string;
  platform_type_code_name: string;
}
[];

export interface IContractProduct {
  contract_product_sequence: number;
  before_contract_product_sequence: number;
  product_code: string;
  price_no: string;
  promise_no: string;
  instance_no: string;
  product_item_kind_code: string;
  product_item_kind_code_name: string;
  product_rating_type_code: string;
  product_rating_type_code_name: string;
  service_status_code: string;
  service_status_code_name: string;
  service_start_date: Date;
  service_end_date: Date;
  product_size: number;
  product_count: number;
  contract_no: string;
}
[];
