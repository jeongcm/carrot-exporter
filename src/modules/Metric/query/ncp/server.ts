export default async function getQueryDataMultipleForServerVPC(totalMsg) {
  // initialize result
  let queryResult = {
    service_name: totalMsg.service_name,
    cluster_uuid: totalMsg.cluster_uuid,
    result: {
      result: []
    }
  }

  // get origin metric data
  const originResult = totalMsg.result
  const originMetric = totalMsg.request // 임시 이름
  originMetric.clusterUuid = totalMsg.cluster_uuid
  let data = []
  let obj = {}
  originResult.forEach((orig) => {
    obj = {
      metric: {
        metric: originMetric
      },
      value: [orig[0], orig[1]]
    }

    data.push({obj})
  })

  queryResult.result.result.push(queryResult.result.result, data)
  return queryResult
}
