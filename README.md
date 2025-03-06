# ☕ Coffee Shop Serverless API

A complete serverless REST API for managing coffee shop orders, built with AWS Lambda, API Gateway, and DynamoDB.

## Features

- Complete CRUD operations for coffee orders
- Serverless architecture using AWS Lambda and DynamoDB
- Multi-stage deployment (dev/prod) with stage-specific configurations
- CI/CD pipeline with GitHub Actions
- Type safety with TypeScript
- Unit tests and comprehensive error handling

## Architecture

![Architecture Diagram](https://via.placeholder.com/800x400?text=Coffee+Shop+API+Architecture)

This project implements a serverless architecture with the following components:

- **API Gateway**: Handles HTTP requests and routes them to appropriate Lambda functions
- **Lambda Functions**: Process requests and perform CRUD operations
- **DynamoDB**: Stores order data
- **GitHub Actions**: Provides CI/CD pipeline for automated testing and deployment

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Create a new coffee order |
| GET | /orders | List all orders |
| GET | /orders/{orderId} | Get a specific order by ID |
| PUT | /orders/{orderId} | Update an existing order |
| DELETE | /orders/{orderId} | Delete an order |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/coffee-shop-api.git
cd coffee-shop-api
```

2. Install dependencies
```bash
npm install
```

3. Start the local development server
```bash
npm run dev
```

The API will be available at http://localhost:3000

### Deployment

To deploy to the development environment:
```bash
npm run deploy:dev
```

To deploy to the production environment:
```bash
npm run deploy:prod
```

## CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration and deployment:

![CI/CD Pipeline Screenshot](https://via.placeholder.com/800x400?text=CI/CD+Pipeline+Screenshot)

The pipeline performs the following steps:
1. Runs linting and type checking
2. Executes unit tests
3. Deploys to the development environment when code is pushed to the master branch
4. Deploys to production when manually triggered with the 'prod' stage parameter

## Local Development

For local development, the project includes:
- Serverless Offline for local API Gateway emulation
- DynamoDB Local for local database testing

Start all services locally:
```bash
npm run dev
```

## Testing the API

Example requests:

### Create an Order
```bash
curl -X POST https://your-api-endpoint/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "items": [
      {
        "name": "Cappuccino",
        "price": 4.50,
        "quantity": 1
      },
      {
        "name": "Croissant",
        "price": 3.25,
        "quantity": 2,
        "options": ["Chocolate"]
      }
    ]
  }'
```

### Get All Orders
```bash
curl https://your-api-endpoint/dev/orders
```

### Get a Specific Order
```bash
curl https://your-api-endpoint/dev/orders/{orderId}
```

### Update an Order
```bash
curl -X PUT https://your-api-endpoint/dev/orders/{orderId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready"
  }'
```

### Delete an Order
```bash
curl -X DELETE https://your-api-endpoint/dev/orders/{orderId}
```