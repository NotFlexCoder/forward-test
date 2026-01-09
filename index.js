import fetch from 'node-fetch';

const token = 'BOT_TOKEN';
const apiUrl = `https://api.telegram.org/bot${token}`;

async function sendMessage(chatId, text) {
  await fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

async function copyMessage(chatId, fromChatId, messageId) {
  const response = await fetch(`${apiUrl}/copyMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId
    })
  });
  return response.json();
}

async function deleteMessage(chatId, messageId) {
  const response = await fetch(`${apiUrl}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId
    })
  });
  return response.json();
}

async function processUpdate(update) {
  if (update.message && update.message.text === '/start') {
    const chatId = update.message.chat.id;
    const welcomeMessage = `🤖 Welcome to Forward Tag Remover Bot!

This bot automatically removes forward tags from messages in your Telegram channels.

📋 How to use:
1. Add me to your channel as an administrator
2. Give me these permissions:
   • Delete messages
   • Post messages

✨ That's it! I will automatically detect forwarded messages and repost them without the forward tag!

Normal messages will not be affected - only forwarded messages will be processed.

Need help? Just add me to your channel and make sure I have the required permissions.`;
    
    await sendMessage(chatId, welcomeMessage);
  }

  if (update.channel_post) {
    const msg = update.channel_post;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    
    if (msg.forward_from || msg.forward_from_chat || msg.forward_sender_name) {
      try {
        await copyMessage(chatId, chatId, messageId);
        await deleteMessage(chatId, messageId);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  }
}

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      await processUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Error:', error);
      res.status(200).send('OK');
    }
  } else {
    res.status(200).send('Bot is running');
  }
};
