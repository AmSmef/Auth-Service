const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const AWS = require('aws-sdk');

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// AWS Lambda setup
AWS.config.update({ region: 'eu-west-2' });
const lambda = new AWS.Lambda();

// Example routes for authentication
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  const params = {
    FunctionName: 'AuthenticationLambda',
    Payload: JSON.stringify({
      action: 'signup',
      username,
      password,
    }),
  };

  try {
    const response = await lambda.invoke(params).promise();
    const data = JSON.parse(response.Payload);

    res.status(data.statusCode).json(JSON.parse(data.body));
  } catch (error) {
    console.error('Error invoking Lambda:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const params = {
    FunctionName: 'AuthenticationLambda',
    Payload: JSON.stringify({
      action: 'login',
      username,
      password,
    }),
  };

  try {
    const response = await lambda.invoke(params).promise();
    const data = JSON.parse(response.Payload);

    res.status(data.statusCode).json(JSON.parse(data.body));
  } catch (error) {
    console.error('Error invoking Lambda:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Authentication service running on port ${PORT}`);
});
