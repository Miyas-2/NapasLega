const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Konfigurasi AWS SDK v3 S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

// Middleware Multer untuk handle langsung upload stream ke S3 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: function (req, file, cb) {
      cb(null, file.mimetype || 'image/jpeg');
    },
    contentDisposition: 'inline',
    // (Opsional) set acl ke public-read jika bucket rules allow
    // acl: 'public-read', 
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Penamaan file unik di S3 (Folder uploads)
      const fileName = `${Date.now()}_${file.originalname}`;
      cb(null, `uploads/${fileName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // Batas upload 5MB
});

module.exports = upload;
