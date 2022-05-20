import AWS from 'aws-sdk';
import { HttpException } from '@common/exceptions/HttpException';
import config from '@config/index';

let space = new AWS.S3({
  endpoint: config.fileUpload.DOEndPoint,
  useAccelerateEndpoint: false,
  credentials: new AWS.Credentials(config.fileUpload.DOAccessKeyId, config.fileUpload.DOSecretAccessKey, null),
});

const BucketName = config.fileUpload.DOBucket;

class fileUploadService {
  public async upload(req: any): Promise<any> {
    
    let uploadParameters = {
      Bucket: BucketName,
      ContentType: req.query.content_type,
      Body: req.file.buffer,
      ACL: req.query.acl,
      Key: req.query.file_name, //we have to define a new file_name which also includes some extra coding to define our path.
    };

    const result = await space.upload(uploadParameters, function (error, data) {
      if (error) {
        console.error(error);
        throw new HttpException(500, error);
      }
      return data;
    });
    return result;
  }
}

export default fileUploadService;
