import AWS from 'aws-sdk';
import { Progress } from 'aws-sdk/lib/request';
import { error } from 'console';
import { S3BucketParams } from '../../types/S3BucketParams';


export module S3Service {

    export function configureBucket(bucketName: string, region: string): AWS.S3 {

        AWS.config.region = 'us-east-1'; // Region
        var poolId: string = process.env.REACT_APP_IDENTITY_POOL_ID ?? 'error';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: poolId,
        });

        // Create a new service object
        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: { Bucket: bucketName }
        });

        return s3;
    }

    export async function uploadPhoto(bucket: AWS.S3, params: S3BucketParams, fileName: string, callBack?: (progress: Progress) => void) {

        bucket.putObject(params).on('httpUploadProgress', (evt) => {
            if (callBack !== undefined) { callBack(evt); }
        }).send((err) => {
            if (err) console.log(err);
        });

    }

    export async function listGalleryPhotos(galleryName: string, callback: (err?: AWS.AWSError, data?: any) => void) {
        AWS.config.region = 'us-east-1'; // Region
        var poolId: string = process.env.REACT_APP_IDENTITY_POOL_ID ?? 'error';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: poolId,
        });
        var bucket = process.env.REACT_APP_S3_BUCKET ?? '';
        var params = { Bucket: bucket };

        // Create a new service object
        var s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: params
        });

        var albumPhotosKey = encodeURIComponent(galleryName) + '/';
        var results: Array<string> = new Array<string>();
        s3.listObjects({ Bucket: bucket, Prefix: albumPhotosKey }, function (this: any, err, data) {
            if (err) {
                return results;
            }
            // 'this' references the AWS.Request instance that represents the response
            const href = this.request.httpRequest.endpoint.href;
            const bucketUrl = href + params.Bucket + "/";


            if (data.Contents !== undefined) {
                data.Contents.map((photo, index) => {
                    var url = s3.getSignedUrl('getObject', { Bucket: bucket, Key: photo.Key });
                    results.push(url);
                });
            }
            callback(err, results);
        });

    }

    export const deletePhoto = (photo: string, gallery?: string) => {
        debugger;
        AWS.config.region = 'us-east-1'; // Region
        var poolId: string = process.env.REACT_APP_IDENTITY_POOL_ID ?? 'error';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: poolId,
        });
        var bucket = process.env.REACT_APP_S3_BUCKET ?? '';

        var s3 = S3Service.configureBucket(bucket, 'us-east-1');

        var params = {
            Bucket: bucket,
            Key: photo,
        };

        // delete object
        s3.deleteObject(params, (err, data) => {
            if (err) { console.log(err); }
        });
    }

}
