import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {errorResponse, formatJSONResponse} from '@libs/api-gateway';
import {createOrder} from '@libs/dynamodb-client';
import {OrderModel} from '@models/order';
import {CreateOrderRequest} from '../types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Parse request body
        const requestBody = JSON.parse(event.body || '{}') as CreateOrderRequest;

        // Validate request
        if (!requestBody.customerName || !requestBody.items || requestBody.items.length === 0) {
            return errorResponse('Missing required fields: customerName and items are required', 400);
        }

        // Create order object
        const order = OrderModel.create(requestBody);

        // Save to DynamoDB
        await createOrder(order);

        return formatJSONResponse({
            message: 'Order created successfully',
            order
        }, 201);
    } catch (error) {
        console.error('[CREATE ORDER ERROR]', error);
        return errorResponse('Could not create order', 500, error as Error);
    }
};
