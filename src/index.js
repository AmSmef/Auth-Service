const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'UserPool';  // Your DynamoDB table name

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const { action, username, password } = body;

    let response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',  // Allow any origin (use a specific domain in production)
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: ''
    };

    if (action === 'signup') {
        // Check if the username already exists
        const params = {
            TableName: TABLE_NAME,
            Key: { username }
        };

        try {
            const result = await dynamoDB.get(params).promise();

            if (result.Item) {
                response.statusCode = 400;
                response.body = JSON.stringify({ success: false, message: 'Username already exists' });
            } else {
                // Store the password as-is (without hashing)
                const putParams = {
                    TableName: TABLE_NAME,
                    Item: { username, password }
                };

                await dynamoDB.put(putParams).promise();

                response.body = JSON.stringify({ success: true });
            }
        } catch (error) {
            console.error(error);
            response.statusCode = 500;
            response.body = JSON.stringify({ success: false, message: 'Internal server error' });
        }
    } else if (action === 'login') {
        // Login logic
        const params = {
            TableName: TABLE_NAME,
            Key: { username }
        };

        try {
            const result = await dynamoDB.get(params).promise();

            if (!result.Item) {
                // Username not found
                response.statusCode = 400;
                response.body = JSON.stringify({ success: false, message: 'Username not found' });
            } else if (result.Item.password !== password) {
                // Password does not match
                response.statusCode = 400;
                response.body = JSON.stringify({ success: false, message: 'Incorrect password' });
            } else {
                // Successful login
                response.body = JSON.stringify({ success: true });
            }
        } catch (error) {
            console.error(error);
            response.statusCode = 500;
            response.body = JSON.stringify({ success: false, message: 'Internal server error' });
        }
    } else {
        response.statusCode = 400;
        response.body = JSON.stringify({ success: false, message: 'Invalid action' });
    }

    return response;
};
