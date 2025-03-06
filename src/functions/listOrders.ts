import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { scanOrders } from '@libs/dynamodb-client';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { lastKey } = event.queryStringParameters || {}; // Get lastEvaluatedKey from query params
        const parsedKey = lastKey ? JSON.parse(decodeURIComponent(lastKey)) : null; // Decode and parse key

        const { items, lastEvaluatedKey } = await scanOrders(parsedKey, 10); // Fetch paginated orders

        return formatJSONResponse({
            count: items?.length || 0,
            orders: items || [],
            nextKey: lastEvaluatedKey ? encodeURIComponent(JSON.stringify(lastEvaluatedKey)) : null, // Encode for API response
        });
    } catch (error) {
        console.error('[LIST ORDERS ERROR]', error);
        return errorResponse('Could not list orders', 500, error as Error);
    }
};
