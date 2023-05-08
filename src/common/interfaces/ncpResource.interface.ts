export interface INcpResource {
  ncpResource: {
    nrn: string;
    platform_type: string;
    product_name: string;
    product_display_name: string;
    region_code: string;
    region_display_name: string;
    resource_type: string;
    resource_id: string;
    resource_name: string;
    create_time: string;
    event_time: string;
  }[];
}
