export interface DynamoDBResponse {
    success: boolean,
    err?: AWS.AWSError,
    data?: AWS.DynamoDB.DocumentClient.QueryOutput
};