const AWS = require('aws-sdk');
const { handler } = require('./index');  // Adjust this based on your file structure

// Mocking DynamoDB DocumentClient
jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    get: jest.fn().mockReturnValue({
      promise: jest.fn(),
    }),
    put: jest.fn().mockReturnValue({
      promise: jest.fn(),
    }),
  };
  return { DynamoDB: { DocumentClient: jest.fn(() => mockDynamoDB) } };
});

describe('AuthenticationLambda Handler', () => {
  let dynamoDBMock;

  beforeAll(() => {
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an error if the username already exists during signup', async () => {
    const event = {
      body: JSON.stringify({ action: 'signup', username: 'existingUser', password: 'password123' }),
    };

    // Mock DynamoDB get response
    dynamoDBMock.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({ Item: { username: 'existingUser' } }),
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Username already exists');
  });

  it('should successfully sign up a new user', async () => {
    const event = {
      body: JSON.stringify({ action: 'signup', username: 'newUser', password: 'password123' }),
    };

    // Mock DynamoDB get response (user does not exist)
    dynamoDBMock.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({ Item: null }),
    });

    // Mock DynamoDB put response (success)
    dynamoDBMock.put.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).success).toBe(true);
  });

  it('should return an error if the username does not exist during login', async () => {
    const event = {
      body: JSON.stringify({ action: 'login', username: 'nonExistentUser', password: 'password123' }),
    };

    // Mock DynamoDB get response (user does not exist)
    dynamoDBMock.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({ Item: null }),
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Username not found');
  });

  it('should return an error if the password is incorrect during login', async () => {
    const event = {
      body: JSON.stringify({ action: 'login', username: 'existingUser', password: 'wrongPassword' }),
    };

    // Mock DynamoDB get response (user exists)
    dynamoDBMock.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({
        Item: { username: 'existingUser', password: 'correctPassword' },
      }),
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Incorrect password');
  });

  it('should successfully login with correct credentials', async () => {
    const event = {
      body: JSON.stringify({ action: 'login', username: 'existingUser', password: 'correctPassword' }),
    };

    // Mock DynamoDB get response (user exists with correct password)
    dynamoDBMock.get.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({
        Item: { username: 'existingUser', password: 'correctPassword' },
      }),
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).success).toBe(true);
  });

  it('should return an error for invalid action', async () => {
    const event = {
      body: JSON.stringify({ action: 'invalidAction', username: 'user', password: 'password123' }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toBe('Invalid action');
  });
});
