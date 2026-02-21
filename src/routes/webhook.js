const express = require('express');
const router = express.Router();
const config = require('../config');
const openaiService = require('../services/openai');

// Verification Endpoint
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`[DEBUG] Verify Token: '${token}', Config Token: '${config.verifyToken}', Mode: '${mode}'`);

    if (mode && token) {
        if (mode === 'subscribe' && token === config.verifyToken) {
            console.log('Webhook verified!');
            res.status(200).send(challenge);
        } else {
            console.error('[ERROR] Token mismatch or wrong mode');
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Incoming Messages
router.post('/', async (req, res) => {
    // Return status 200 immediately to WhatsApp to avoid timeout
    res.sendStatus(200);

    const body = req.body;

    try {
        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Phone number

                if (message.type === 'text') {
                    const text = message.text.body;
                    console.log(`[Webhook] Received message from ${from}: ${text}`);

                    // Trigger AI processing asynchronously
                    await openaiService.handleIncomingMessage(from, text);
                } else {
                    console.log(`[Webhook] Received non-text message type: ${message.type}`);
                }
            }
        }
    } catch (error) {
        console.error('Error handling webhook event:', error);
    }
});

module.exports = router;
