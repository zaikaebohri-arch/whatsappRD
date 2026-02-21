const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const webhookRoutes = require('./routes/webhook');

const app = express();

app.use(bodyParser.json());

// Routes
app.use('/webhook/whatsapp', webhookRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Ava AI Agent is running (Official API Mode).');
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});
