const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory directly
app.use(express.static(__dirname));

// API Endpoint to handle form submissions
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // Basic validation for consent
        if (!formData.consent) {
            return res.status(400).json({ success: false, message: 'Consent to data processing is legally required to proceed.' });
        }

        // --- DESTINATION LOGIC ---
        // Here we send data to a Discord Webhook. You must set DISCORD_WEBHOOK_URL in Render env vars.
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        
        if (webhookUrl) {
            // Format the message for Discord
            const discordMessage = {
                embeds: [{
                    title: "⚠️ NEW BLACKMAIL CONTRACT SIGNED",
                    color: 13052993, // Dark Red/Crimson color
                    fields: [
                        { name: "Legal Name", value: formData.legalName || 'N/A', inline: true },
                        { name: "Age", value: formData.age || 'N/A', inline: true },
                        { name: "Personal Email", value: formData.personalEmail || 'N/A' },
                        { name: "Phone Number", value: formData.phone || 'N/A', inline: true },
                        { name: "Primary Social Contact", value: formData.contact || 'N/A', inline: true },
                        { name: "Monthly Tribute Budget", value: formData.budget ? `$${formData.budget}` : 'N/A' },
                        { name: "Throne Confirmation", value: formData.throneConfirmation || 'N/A' },
                        { name: "Primary Target Email", value: formData.targetEmail || 'N/A' },
                        { name: "Secondary Target Email", value: formData.targetEmail2 || 'N/A' },
                        { name: "Deepest Secret", value: formData.secret || 'N/A' },
                        { name: "Digital Signature", value: formData.signature || 'N/A', inline: true },
                        { name: "Consent & Liability", value: formData.consent ? "✅ Accepted" : "❌ Denied", inline: true }
                    ],
                    footer: {
                        text: "Confidential - DO NOT DISTRIBUTE"
                    },
                    timestamp: new Date().toISOString()
                }]
            };

            // Send to Discord using Node.js native fetch (Node 18+)
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordMessage)
            });
            console.log("Contract successfully sent to Discord Webhook.");
        } else {
            console.log("DISCORD_WEBHOOK_URL not set. Contract received locally:");
            console.log(formData);
        }

        // Return success to the frontend
        res.status(200).json({ success: true, message: 'Contract officially signed and securely submitted.' });
    } catch (error) {
        console.error("Error submitting contract:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error. The contract could not be processed at this time.' });
    }
});

// Fallback route to serve index.html for any unknown paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the app locally at http://localhost:${PORT}`);
});
