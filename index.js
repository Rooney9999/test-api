const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/whatsappBusinessMessages", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define message schema and model
const messageSchema = new mongoose.Schema({
  from: String,
  body: String,
  timestamp: Date,
  messageId: String,
});

const Message = mongoose.model("Message", messageSchema);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Webhook endpoint to receive incoming messages from WhatsApp Business API
app.post("/whatsapp-webhook", async (req, res) => {
  const { entry } = req.body;

  if (entry && entry.length > 0) {
    const messages = entry[0].changes[0].value.messages;

    // Process each incoming message
    messages.forEach(async (msg) => {
      const from = msg.from; // Sender's number
      const body = msg.text.body; // Message text
      const messageId = msg.id; // Unique message ID
      const timestamp = new Date(parseInt(msg.timestamp) * 1000); // Convert to Date

      try {
        // Save message to MongoDB
        const newMessage = new Message({
          from,
          body,
          timestamp,
          messageId,
        });
        await newMessage.save();
        console.log("Message saved successfully");
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Respond with 200 OK to acknowledge receipt
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
