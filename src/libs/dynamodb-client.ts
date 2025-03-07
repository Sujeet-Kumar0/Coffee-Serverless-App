import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const ORDERS_TABLE = process.env.ORDERS_TABLE || '';

export const getOrder = async (orderId: string) => {
    const params = {
        TableName: ORDERS_TABLE,
        Key: {orderId}
    };

    const {Item} = await dynamoDb.send(new GetCommand(params));
    return Item;
};

export const createOrder = async (order: Record<string, any>) => {
    const params = {
        TableName: ORDERS_TABLE,
        Item: order
    };

    await dynamoDb.send(new PutCommand(params));
    return order;
};

export const updateOrder = async (
    orderId: string,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
) => {
    const params = {
        TableName: ORDERS_TABLE,
        Key: {orderId},
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
        ...(expressionAttributeNames && { ExpressionAttributeNames: expressionAttributeNames })
    };

    console.log('params', JSON.stringify(params, null, 2));

    const {Attributes} = await dynamoDb.send(new UpdateCommand(params as UpdateCommandInput));
    return Attributes;
};

export const deleteOrder = async (orderId: string) => {
    const params = {
        TableName: ORDERS_TABLE,
        Key: {orderId}
    };

    await dynamoDb.send(new DeleteCommand(params));
};

export const scanOrders = async (lastEvaluatedKey = null, limit = 10) => {
    const params = {
        TableName: ORDERS_TABLE,
        Limit: limit,
        ...(lastEvaluatedKey ? {ExclusiveStartKey: lastEvaluatedKey} : {})
    };

    const {Items, LastEvaluatedKey} = await dynamoDb.send(new ScanCommand(params));

    return {
        items: Items,
        lastEvaluatedKey: LastEvaluatedKey, // Pass this to fetch the next page
    };
};
