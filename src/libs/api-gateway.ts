export interface ApiGatewayResponse {
    statusCode: number;
    headers: {
        [header: string]: string | boolean;
    };
    body: string;
}

export const formatJSONResponse = (
    response: Record<string, unknown>,
    statusCode: number = 200
): ApiGatewayResponse => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
    };
};

export const errorResponse = (
    message: string,
    statusCode: number = 500,
    error?: Error
): ApiGatewayResponse => {
    return formatJSONResponse({
        message,
        ...(process.env.IS_OFFLINE && error ? { error: error.message, stack: error.stack } : {})
    }, statusCode);
};
