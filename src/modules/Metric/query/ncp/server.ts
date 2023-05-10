export default async function getServerInstanceMetric(totalMsg) {
  // initialize result
  let queryResult = {
    service_name: totalMsg.service_name,
    cluster_uuid: totalMsg.cluster_uuid,
    result: {
      result: []
    }
  }

  // get origin metric data
  totalMsg.result[0].forEach((serverInstance) => {
    serverInstance.outputs.forEach((output) => {
      output.dps.forEach((dp) => {
        queryResult.result.result.push(
          {
            metric: {
              aggregation: output.aggregation,
              instanceNo: output.dimensions.instanceNo,
              interval: output.interval,
              __name__: `co_ncp_${output.metric}`,
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
