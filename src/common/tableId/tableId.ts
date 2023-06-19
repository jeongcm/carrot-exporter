import config from "@/config";
import axios from "@common/httpClient/axios";
import DB from "@/database";
import { HttpException } from "@common/exceptions/HttpException";

export default class TableIdService {
  public alertRule = DB.AlertRule
  public async tableIdBulk(request) {
    let tableIds: any = []

    const getTableIdUrl = config.coApi.url + ":" + config.coApi.port + "/tableId/Bulk"
    let apiResult = await axios.post (getTableIdUrl, request, {maxContentLength:Infinity, maxBodyLength: Infinity})

    if (!apiResult.data) {
      throw new HttpException(404, 'not found table id response data')
    }

    let result = apiResult.data
    if (result.data.tableIdRange <= 0) {
      throw new HttpException(404, 'table id response data is empty')
    }
    let prefix = result.data.tableIdFinalIssued.slice(0, 8)
    let finalTableSequence = parseInt(result.data.tableIdFinalIssued.slice(-8))
    let startSequence = finalTableSequence - result.data.tableIdRange

    for (let index = startSequence; index < finalTableSequence; index++) {
      let paddedNumber = index.toString().padStart(8, '0')
      tableIds.push(`${prefix}${paddedNumber}`)
    }

    return tableIds
  }
}
