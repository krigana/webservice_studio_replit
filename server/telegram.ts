interface TelegramMessage {
  name: string;
  phone: string;
  message: string;
  timestamp: Date;
}

export async function sendTelegramNotification(data: TelegramMessage): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured');
      return false;
    }

    const formattedMessage = `
🔔 *Новое сообщение с сайта web-service.studio!*

👤 *Имя:* ${data.name}
📞 *Телефон:* ${data.phone}
💬 *Сообщение:*
${data.message}

⏰ *Время:* ${data.timestamp.toLocaleString('ru-RU', {
      timeZone: 'Europe/Kiev',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Telegram API error:', errorData);
      return false;
    }

    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}