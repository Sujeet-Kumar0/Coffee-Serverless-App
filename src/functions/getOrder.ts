import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { getOrder } from '@libs/dynamodb-client';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return errorResponse('Missing order ID', 400);
        }

        const order = await getOrder(orderId);

        if (!order) {
            return errorResponse('Order not found', 404);
        }

        return formatJSONResponse({
            order
        });
    } catch (error) {
        console.error('[GET ORDER ERROR]', error);
        return errorResponse('Could not retrieve order', 500, error as Error);
    }
};
