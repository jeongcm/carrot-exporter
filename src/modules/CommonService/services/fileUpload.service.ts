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
        throw new HttpException(500, error);
      }
      return data;
    });
    return result;
  }

  public async uploadService(fileName: string, contentType: string, file: any): Promise<any> {
    try {
      let uploadParameters = {
        Bucket: BucketName,
        ContentType: contentType,
        Body: file.buffer,
        ACL: 'public-read',
        Key: fileName,
      };

      const result = space.upload(uploadParameters);
      var promise = result.promise();

      let data = await promise.then(
        function (data) {
          return {
            status: 'ok',
            data: data,
          };
        },
        function (err) {
          return {
            status: 'error',
            data: err,
          };
        },
      );
      return data;
    } catch (err) {
      return {
        status: 'error',
        data: err,
      }
    }
  }

  public async get(req: any): Promise<any> {
    let downloadParameters = {
      Bucket: BucketName,
      Key: req.params.fileName,
    };

    const result = await space.getObject(downloadParameters, function (error, data) {
      if (error) {
        throw new HttpException(500, error.message);
      }
      return data;
    });
    return result;
  }

  public async delete(req: any): Promise<any> {
    let downloadParameters = {
      Bucket: BucketName,
      Key: req.query.fileName,
    };
    const result = await space.deleteObject(downloadParameters, function (error, data) {
      if (error) {
        console.error(error.code);
        throw new HttpException(500, error.message);
      }
      return data;
    });
    return result;
  }

  public uploadedFileLink(fileName: any): String {
    return `https://${config.fileUpload.DOEndPoint}/${BucketName}/${fileName}`;
  }
}

export default fileUploadService;
