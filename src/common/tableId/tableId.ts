import config from "@/config";
import axios from "@common/httpClient/axios";
import DB from "@/database";
import { HttpException } from "@common/exceptions/HttpException";

export default class TableIdService {
  public alertRule = DB.AlertRule
  public async tableIdBulk(request) {
    let tableIds: any = []

    const getTableIdUrl = config.coApi.url + ":" + config.coApi.port + "/tableId/Bulk"
    let result = await axios.post (getTableIdUrl, request, {maxContentLength:Infinity, maxBodyLength: Infinity})

    if (!result.data) {
      throw new HttpException(404, 'not found table id response data')
    }

    let data = result.data
    if (data.tableIdRange <= 0) {
      throw new HttpException(404, 'table id response data is empty')
    }
    let prefix = data.tableIdFinalIssued.slice(8)
    let finalTableSequence = parseInt(data.tableIdFinalIssued.slice(-8))
    let startSequence = finalTableSequence - data.tableIdRange + 1

    for (let index = startSequence; index < finalTableSequence; index++) {
      let paddedNumber = index.toString().padStart(8, '0')
      tableIds.push(`${prefix}${paddedNumber}`)
    }

    return tableIds
  }
}
