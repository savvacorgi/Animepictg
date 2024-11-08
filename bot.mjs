import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const channelId = process.env.CHANNEL_ID;


async function getImage() {
    try {
        const response = await fetch('https://pic.re/image', {
            method: 'POST'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

async function sendImage() {
    const imageData = await getImage();
    if (imageData && imageData.file_url) {
        const imageUrl = imageData.file_url;
        const sourceUrl = imageData.source || 'Source not provided';
        const messageText = `Photo: [${imageUrl}](${imageUrl})\nAuthor: ${imageData.author || 'Unknown'}\nSource: [${sourceUrl}](${sourceUrl})`;

        await bot.sendPhoto(channelId, imageUrl, { caption: messageText, parse_mode: 'Markdown' });
    } else {
        console.error('Failed to get image, please try again later.');
    }
}

try {
setInterval(sendImage, 30 * 1000);
} catch (e) {
console.log(e)
}
