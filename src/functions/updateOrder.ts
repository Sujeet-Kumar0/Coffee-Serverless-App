import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, errorResponse } from '@libs/api-gateway';
import { getOrder, updateOrder } from '@libs/dynamodb-client';
import { UpdateOrderRequest } from '../types';

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

        // Parse update data
        const updateData = JSON.parse(event.body || '{}') as UpdateOrderRequest;

        // Prepare update expression
        let updateExpression = 'SET updatedAt = :updatedAt';
        const expressionAttributeValues: Record<string, any> = {
            ':updatedAt': new Date().toISOString()
        };

        // Add fields to update
        if (updateData.customerName) {
            updateExpression += ', customerName = :customerName';
            expressionAttributeValues[':customerName'] = updateData.customerName;
        }

        if (updateData.status) {
            updateExpression += ', #status = :status';
            expressionAttributeValues[':status'] = updateData.status;
        }

        if (updateData.items) {
            updateExpression += ', items = :items';
            expressionAttributeValues[':items'] = updateData.items;

            // Recalculate total price
            const totalPrice = updateData.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            updateExpression += ', totalPrice = :totalPrice';
            expressionAttributeValues[':totalPrice'] = totalPrice;
        }

        // Update in DynamoDB
        const updatedOrder = await updateOrder(orderId, updateExpression, expressionAttributeValues);

        return formatJSONResponse({
            message: 'Order updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('[UPDATE ORDER ERROR]', error);
        return errorResponse('Could not update order', 500, error as Error);
    }
};