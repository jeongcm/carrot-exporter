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
  contract_info: string;
  pay_currency_code: string;
  pay_currency_code_name: string;
  this_month_applied_exchange_rate: number;
  contract_demand_product_info: string;
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
  contract_demand_cost_sequence: number;
}
[];

export interface IContractDemandProduct {
  contract_product_sequence: number;
  before_contract_product_sequence: number;
  demand_month: string;
  contract_demand_cost_sequence: number;
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

export interface IUsage {
  metering_type_code: number;
  metering_type_code_name: number;
  product_code: string;
  use_month: string;
  usage_quantity: string;
  unit_code: string;
  unit_code_name: string;
  user_usage_quantity: string;
  user_unit_code: string;
  user_unit_code_name: string;
  contract_no: string;
  contract_product_sequence: number;
}
[];

export interface IProduct {
  product_item_kind_code: string;
  product_item_kind_code_name: string;
  product_item_kind_detail_code: string;
  product_item_kind_detail_code_name: string;
  product_code: string;
  product_code_name: string;
  product_description: string;
  software_type_code: string;
  software_type_code_name: string;
  product_type_code: string;
  product_type_code_name: string;
  gpu_count: number;
  cpu_count: number;
  memory_size: number;
  base_block_storage_size: number;
  db_kind_code: string;
  db_kind_code_name: string;
  os_information: string;
  platform_type_code: string;
  platform_type_code_name: string;
  os_type_code: string;
  os_type_code_name: string;
  platform_category_code: string;
  disk_type_code: string;
  disk_type_code_name: string;
  disk_detail_type_code: string;
  disk_detail_type_code_name: string;
  generation_code: string;
  price_no: string;
  promise_list: string;
  period_unit_list: string;
  country_unit_list: string;
  package_unit_list: string;
}
[];

export interface IPrice {
  product_code: string;
  price_no: string;
  price_type_code: string;
  price_type_code_name: string;
  region: string;
  charging_unit_type_code: string;
  charging_unit_type_code_name: string;
  rating_unit_type_code: string;
  rating_unit_type_code_name: string;
  product_type_code_name: string;
  charging_unit_basic_value: number;
  product_rating_type_code: string;
  product_rating_type_code_name: string;
  unit_code: string;
  unit_code_name: string;
  price: number;
  promise_list: string;
  condition_type_code: string;
  condition_type_code_name: string;
  condition_price: number;
  price_description: string;
  free_unit_code: string;
  free_unit_code_name: string;
  free_value: number;
  metering_unit_code: string;
  metering_unit_code_name: string;
  start_date: string;
  price_attribute_code: string;
  price_attribute_code_name: string;
  price_version_name: string;
  pay_currency_code: string;
  pay_currency_code_name: string;
  period_unit_list: string;
  country_unit_list: string;
  package_unit_list: string;
}
[];

export interface IDemandCost {
  member_no: string;
  demand_month: string;
  demand_no: string;
  integration_demand_no: string;
  demand_attribute_code: string;
  demand_attribute_code_name: string;
  use_amount: number;
  promise_discount_amount: number;
  etc_discount_amount: number;
  customer_discount_amount: number;
  product_discount_amount: number;
  credit_discount_amount: number;
  rounddown_discount_amount: number;
  currency_discount_amount: number;
  coin_use_amount: number;
  default_amount: number;
  this_month_demand_amount: number;
  this_month_vat_ratio: number;
  this_month_vat_amount: number;
  this_month_amount_including_vat: number;
  total_demand_amount: number;
  is_paid_up: string;
  paid_up_date: Date;
  overdue_occur_date: Date;
  overdue_plus_amount: number;
  overdue_ratio: number;
  this_month_overdue_amount: number;
  before_month_demand_no: string;
  total_overdue_amount: number;
  write_date: Date;
  member_price_discount_amount: number;
  member_promise_discount_add_amount: number;
  pay_currency_code: string;
  pay_currency_code_name: string;
  this_month_applied_exchange_rate: number;
  promotion_discount_amount: number;
}
[];

export interface ICostRelationCode {
  contract_type_code: string;
  contract_type_code_name: string;
  product_item_kind_code: string;
  product_item_kind_code_name: string;
  product_rating_type_code: string;
  product_rating_type_code_name: string;
  metering_type_code: string;
  metering_type_code_name: string;
  demand_type_code: string;
  demand_type_code_name: string;
  demand_type_detail_code: string;
  demand_type_detail_code_name: string;
  product_demand_type_code: string;
  product_demand_type_code_name: string;
}
[];
