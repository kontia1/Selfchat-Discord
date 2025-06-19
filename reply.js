const fs = require('fs');
const fetch = require('node-fetch');
const config = require('./config.json');

function loadMessageMap() {
  const lines = fs.readFileSync('reply.txt', 'utf-8').split('\n').filter(Boolean);
  const map = {};
  for (const line of lines) {
    const [trigger, response] = line.split('=');
    if (trigger && response) {
      map[trigger.trim().toLowerCase()] = response.trim();
    }
  }
  return map;
}

async function getUserInfo(token) {
  const res = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: token }
  });
  const data = await res.json();
  if (!data.username) throw new Error("Token tidak valid.");
  return {
    id: data.id,
    username: `${data.username}#${data.discriminator}`
  };
}

async function fetchLastMessage(channelId, token) {
  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=1`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0] : null;
}

async function sendMessage(channelId, token, content, replyToId = null) {
  const body = { content };

  if (replyToId) {
    body.message_reference = {
      message_id: replyToId,
      channel_id: channelId
    };
  }

  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

async function startPolling(account) {
  const { token, channels } = account;
  const messageMap = loadMessageMap();
  const { id: userId, username } = await getUserInfo(token);
  console.log(`✅ Logged in as ${username}`);

  const lastMessageIds = {};

  setInterval(async () => {
    for (const channelId of channels) {
      try {
        const lastMsg = await fetchLastMessage(channelId, token);
        if (!lastMsg || lastMsg.author.id === userId) continue;
        if (lastMessageIds[channelId] === lastMsg.id) continue;

        const content = lastMsg.content.toLowerCase();
        for (const trigger in messageMap) {
          if (content.includes(trigger)) {
            const reply = messageMap[trigger];
            await sendMessage(channelId, token, reply, lastMsg.id);

            const senderName = `${lastMsg.author.username}#${lastMsg.author.discriminator}`;
            console.log(`💬 ${username} → ${senderName}: replied to "${content}"`);
            break;
          }
        }

        lastMessageIds[channelId] = lastMsg.id;
      } catch (err) {
        console.error(`❌ Error on ${username} in channel ${channelId}: ${err.message}`);
      }
    }
  }, 10000); // 10 detik polling
}

(async () => {
  for (const account of config) {
    try {
      await startPolling(account);
    } catch (err) {
      console.error(`❌ Failed to start account: ${err.message}`);
    }
  }
})();
