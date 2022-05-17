import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import config from '@config/index';

const s3 = new aws.S3({
  accessKeyId: config.fileUpload.awsS3AccessKeyId,
  secretAccessKey: config.fileUpload.awsS3SecretAccessKey,
  region: config.fileUpload.awsS3DefaultRegion,
});

class fileUploadS3Service {
  public upload(file) {
    multer({
      storage: multerS3({
        s3: s3,
        bucket: config.fileUpload.awsS3Bucket,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        metadata: (req, file, cb) => {
          cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
          cb(null, 'files_from_node/' + Date.now().toString() + file.originalname);
        },
      }),
    });
  }
}

export default fileUploadS3Service;
