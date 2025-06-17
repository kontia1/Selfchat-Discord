const fs = require('fs');
const fetch = require('node-fetch');

const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
const messages = fs.readFileSync('mes.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0);

// 20–30 second random interval between messages
function randomInterval() {
  return Math.floor(Math.random() * (30000 - 20000 + 1)) + 20000;
}

// Always delete after 1 second
function deleteDelay() {
  return 500;
}

// Pick a random message from mes.txt
function randomMessage() {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// Send a message and delete it after 1s
async function sendMessage(token, channelId, content) {
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ [${channelId}] Sent: ${content}`);

      setTimeout(async () => {
        try {
          const deleteRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${data.id}`, {
            method: 'DELETE',
            headers: { Authorization: token }
          });

          if (deleteRes.ok) {
            console.log(`🗑️  [${channelId}] Deleted after 1s`);
          } else {
            const err = await deleteRes.json();
            console.error(`❌ [${channelId}] Delete failed:`, err.message || err);
          }
        } catch (err) {
          console.error(`❌ [${channelId}] Delete error:`, err.message);
        }
      }, deleteDelay());

    } else {
      console.error(`❌ [${channelId}] Send failed:`, data.message || data);
    }
  } catch (err) {
    console.error(`❌ [${channelId}] Error sending:`, err.message);
  }
}

// Loop to repeatedly send messages on interval
function startLoop(token, channelId) {
  async function loop() {
    const message = randomMessage();
    await sendMessage(token, channelId, message);
    const delay = randomInterval();
    console.log(`⌛ [${channelId}] Next in ${(delay / 1000).toFixed(1)}s`);
    setTimeout(loop, delay);
  }
  loop();
}

// Launch bot for each account and channel
config.forEach(({ token, channels }, index) => {
  channels.forEach(channelId => {
    console.log(`🔁 Starting bot ${index + 1} on channel ${channelId}`);
    startLoop(token, channelId);
  });
});
