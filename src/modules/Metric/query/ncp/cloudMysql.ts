export default async function getCloudMysqlInstanceMetric(totalMsg, clusterUuid) {
  // initialize result
  let queryResult = {
    service_name: totalMsg.service_name,
    cluster_uuid: clusterUuid,
    result: {
      result: []
    }
  }

  // get origin metric data
  totalMsg.result[0][0]?.forEach((cloudMysqlInstance) => {
    cloudMysqlInstance?.outputs?.forEach((output) => {
      output.dps.forEach((dp) => {
        queryResult.result.result.push(
          {
            metric: {
              aggregation: output.aggregation,
              instanceNo: output.dimensions.instanceNo,
              interval: output.interval,
              __name__: `ncp_${output.metric}`,
              metric: output.metric,
              productName: output.productName
            },
            value: [dp[0], dp[1]]
          }
        )
      })
    })
  })


  return queryResult
}
