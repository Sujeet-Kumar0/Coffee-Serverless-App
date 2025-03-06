import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { deleteOrder, getOrder } from '@libs/dynamodb-client';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return errorResponse('Missing order ID', 400);
        }

        // Check if order exists
        const existingOrder = await getOrder(orderId);

        if (!existingOrder) {
            return errorResponse('Order not found', 404);
        }

        // Delete from DynamoDB
        await deleteOrder(orderId);

        return formatJSONResponse({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('[DELETE ORDER ERROR]', error);
        return errorResponse('Could not delete order', 500, error as Error);
    }
};
