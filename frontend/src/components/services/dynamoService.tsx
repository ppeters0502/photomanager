import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { DynamoDBResponse } from '../../types/DynamoDBResponse';

export module dynamoService {

    export function configureDynamoDB(): AWS.DynamoDB.DocumentClient {
        AWS.config.region = 'us-east-1'; // Region
        var poolId: string = process.env.REACT_APP_IDENTITY_POOL_ID ?? 'error';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: poolId,
        });
        const docClient = new AWS.DynamoDB.DocumentClient();
        return docClient;
    }

    export async function deleteGallery(galleryId: string, callback: (err: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.DeleteItemOutput) => void) {
        const docClient = configureDynamoDB();
        var photoParams = {
            TableName: 'galleries',
            Key: {
                gallery_id: galleryId,
            },
        }
        docClient.delete(photoParams, callback);
    }

    export async function deleteGalleryPhoto(galleryId: string, photoId: string, callback: (err: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.DeleteItemOutput) => void) {
        const docClient = configureDynamoDB();
        var photoParams = {
            TableName: 'gallery',
            Key: {
                photo_id: photoId,
                gallery_id: galleryId,
            },
        }
        docClient.delete(photoParams, callback);

    }

    export async function deletePhoto(photoId: string, callback: (err: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.DeleteItemOutput) => void) {
        const docClient = configureDynamoDB();
        var photoParams = {
            TableName: 'photos',
            Key: {
                photo_id: photoId,
            },
        }
        docClient.delete(photoParams, callback);
    }

    export async function getGalleries(callBack: (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => void) {
        const docClient = configureDynamoDB();
        docClient.scan(
            {
                TableName: 'galleries',
                FilterExpression: '#active = :true',
                ExpressionAttributeValues: {
                    ':true': true,
                },
                ExpressionAttributeNames: {
                    '#active': 'active',
                },
            },
            (err, data) => {
                if (err) {
                    callBack(false, err);
                } else {
                    callBack(true, undefined, data);
                }
            }
        );
    }

    export async function getGalleryById(galleryId: string, callBack: (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => void) {
        const docClient = configureDynamoDB();
        docClient.query(
            {
                TableName: 'galleries',
                KeyConditionExpression: '#galleryId = :galleryIdValue',
                ExpressionAttributeValues: {
                    ':galleryIdValue': galleryId,
                },
                ExpressionAttributeNames: {
                    '#galleryId': 'gallery_id',
                },
            },
            (err, data) => {
                if (err) {
                    callBack(false, err);
                } else {
                    callBack(true, undefined, data);
                }
            }
        );
    }

    export function getGalleryRecords(galleryId: string, callBack: (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => void) {
        const docClient = configureDynamoDB();
        docClient.query(
            {
                TableName: 'gallery',
                KeyConditionExpression: '#galleryId = :galleryIdValue',
                ExpressionAttributeValues: {
                    ':galleryIdValue': galleryId,
                },
                ExpressionAttributeNames: {
                    '#galleryId': 'gallery_id',
                },
            },
            (err, data) => {
                if (err) {
                    callBack(false, err);
                } else {
                    callBack(true, undefined, data);
                }
            }
        );
    }

    export function insertGallery(tableName: string, data: any): string {
        const docClient = configureDynamoDB();
        const unique_id = uuid();
        var id = unique_id.slice(0, 12);
        var params = {
            TableName: tableName,
            Item: {
                gallery_id: id,
                name: data,
                active: true,
            },
        };

        docClient.put(params, (err, data) => {
            if (err) {
                console.log('Error', err);
                id = '';
            } else {
                console.log('Success', id);
            }
        });
        return id;
    }

    export function insertGalleryPhoto(galleryId: string, data: any): string {
        const docClient = configureDynamoDB();
        const unique_id = uuid();
        // First insert into photos table
        var id = unique_id.slice(0, 12);

        var photoParams = {
            TableName: 'photos',
            Item: {
                photo_id: id,
                photo_name: data,
            },
        }

        docClient.put(photoParams, (err, data) => {
            if (err) {
                console.log('Error', err);
                id = '';
            } else {
                console.log('Success', id);
            }
        });

        var galleryPhotoParams = {
            TableName: 'gallery',
            Item: {
                gallery_id: galleryId,
                photo_id: id,
                photo_name: data
            },
        };

        docClient.put(galleryPhotoParams, (err, data) => {
            if (err) {
                console.log('Error', err);
                id = '';
            } else {
                console.log('Success', id);
            }
        });
        return id;
    }

    export function insertRecord(tableName: string, data: string): string {
        const docClient = configureDynamoDB();
        const unique_id = uuid();
        var id = unique_id.slice(0, 12);
        var params = {
            TableName: tableName,
            Item: {
                photo_id: id,
                photo_name: data,
            },
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log('Error', err);
                id = '';
            } else {
                console.log('Success', id);
            }
        });
        return id;
    }
}
