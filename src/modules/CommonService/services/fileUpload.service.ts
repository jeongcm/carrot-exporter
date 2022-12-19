import AWS from 'aws-sdk';
import { HttpException } from '@common/exceptions/HttpException';
import config from '@config/index';

const space = new AWS.S3({
  region: config.fileUpload.awsS3DefaultRegion,
  endpoint: config.fileUpload.DOEndPoint,
  useAccelerateEndpoint: false,
  credentials: new AWS.Credentials(config.fileUpload.DOAccessKeyId, config.fileUpload.DOSecretAccessKey, null),
});

const BucketName = config.fileUpload.DOBucket;

class fileUploadService {
  public async upload(req: any): Promise<any> {
    const uploadParameters = {
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
      const uploadParameters = {
        Bucket: BucketName,
        ContentType: contentType,
        Body: file.buffer,
        ACL: 'public-read',
        Key: fileName,
      };

      console.log(uploadParameters);
      console.log(config.fileUpload);

      const result = space.upload(uploadParameters);
      const promise = result.promise();

      const data = await promise.then(
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
      };
    }
  }
  public async uploadServiceWithJson(fileName: string, fileType: string, body: any): Promise<any> {
    try {
      const uploadParameters = {
        Bucket: BucketName,
        ContentType: fileType,
        Body: body,
        ACL: 'public-read',
        Key: fileName,
      };
      console.log('uploadParameters', uploadParameters);
      console.log(config.fileUpload);
      const result = space.upload(uploadParameters);
      const promise = result.promise();

      const data = await promise.then(
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
      };
    }
  }
  public async get(req: any): Promise<any> {
    const downloadParameters = {
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
    const downloadParameters = {
      Bucket: BucketName,
      Key: req.query.fileName,
    };
    const result = await space.deleteObject(downloadParameters, function (error, data) {
      if (error) {
        throw new HttpException(500, error.message);
      }
      return data;
    });
    return result;
  }

  public async deleteAll(req: any): Promise<any> {
    const downloadParameters = {
      Bucket: BucketName,
      Delete: {
        Objects: req.query.fileNames.map(fileNamesX => {
          return {
            Key: fileNamesX,
          };
        }),
      },
    };
    const result = await space.deleteObjects(downloadParameters, function (error, data) {
      if (error) {
        throw new HttpException(500, error.message);
      }
      return data;
    });
    return result;
  }

  public uploadedFileLink(fileName: any): String {
    return `${config.fileUpload.DOEndPoint}/${BucketName}/${fileName}`;
  }

  public getBucketFolderSize(bucket: string, folder: string) {
    const params = {
      Bucket: bucket,
      Prefix: folder + '/',
    };
    let size = 0;

    return new Promise((resolve, reject) => {
      space.listObjects(params, function (err, data) {
        console.log(data.Contents);
        if (err) {
          console.log('ListOfOjbect Error:', err);
          reject(err);
        } else {
          for (let i = 0; i < data?.Contents?.length; i++) {
            size = size + data?.Contents[i].Size;
          }
          console.log('size sum', size);
          resolve(size);
        }
      });
    });
  }

  public getfilesOverSize(bucket: string, folder: string, maxSize: number) {
    const params = {
      Bucket: bucket,
      Prefix: folder + '/',
    };
    let size = 0;
    const filteredKey = [];
    return new Promise((resolve, reject) => {
      space.listObjects(params, function (err, data) {
        //console.log(data);
        if (err) {
          console.log('ListOfOjbect Error:', err);
          reject(err);
        } else {
          const sortedData = data?.Contents;
          sortedData.sort(function (a, b) {
            const c = new Date(a.LastModified);
            const d = new Date(b.LastModified);
            return Number(d) - Number(c);
          });
          for (let i = 0; i < sortedData.length; i++) {
            size = size + sortedData[i].Size;
            //console.log(`size - ${size}, maxSize - ${maxSize}`);
            if (size > maxSize) {
              let trimmedKey = sortedData[i]?.Key;
              trimmedKey = trimmedKey.replace(/\s/g, '');
              filteredKey.push({ Key: trimmedKey });
            }
          }
          console.log('size', size);
          resolve(filteredKey);
        }
      });
    });
  }

  public async deleteBucketFolderFiles(bucket: string, folder: string, maxSize: number) {
    const filteredKey = await this.getfilesOverSize(bucket, folder, maxSize);

    const downloadParameters = {
      Bucket: bucket,
      Delete: {
        Objects: filteredKey,
      },
    };
    let result;

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      space.deleteObjects(downloadParameters, function (error, data) {
        if (error) {
          console.log('deleteObjects Error:', error);
          reject(error);
        }
        result = data;
        resolve(result);
      });
    });
  }
} //end of class

export default fileUploadService;
