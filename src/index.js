import { Bot, InputFile } from 'grammy';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
//cfg
const SEND_INTERVAL_MS = 30 * 1000;

class ImageSenderBot {
    constructor(token, channelId) {
        if (!token) {
            throw new Error('plz add TELEGRAM_TOKEN in env');
        }
        if (!channelId) {
            throw new Error('plz add CHANNEL_ID in env');
        }

        this.token = token;
        this.channelId = channelId;
        this.bot = new Bot(this.token);
        this.intervalId = null;

        this.fetchImage = this.fetchImage.bind(this);
        this.formatCaption = this.formatCaption.bind(this);
        this.sendImageToChannel = this.sendImageToChannel.bind(this);
        this.startSending = this.startSending.bind(this);
        this.stopSending = this.stopSending.bind(this);
    }

    async fetchImage() {
        try {
            const response = await axios.post('https://pic.re/image');
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error(`HTTP status ${error.response.status}`, error.response.data);
            } else if (error.request) {
                console.error( error.request);
            } else {
                console.error(error.message);
            }
            return null;
        }
    }

    formatCaption(imageData) {
        const escapeMdV2 = (text) => String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

        const author = imageData.author ? escapeMdV2(imageData.author) : 'Unknown';
        const sourceUrl = imageData.source && String(imageData.source).trim() ? imageData.source : '#';
        const sourceText = sourceUrl !== '#' ? 'Source' : 'None';

        let caption = `Author: ${author}\nFile: [image](${imageData.file_url})\n`;
        if (sourceUrl !== '#') {
            caption += `Source: [${sourceText}](${sourceUrl})`;
        } else {
            caption += sourceText;
        }
        return caption;
    }

    async sendImageToChannel() {
        console.log('Get and send...');
        const imageData = await this.fetchImage();

        if (imageData && imageData.file_url) {
            let imageUrl = imageData.file_url;
            let caption = this.formatCaption(imageData);

            if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = 'https://' + imageUrl;
            }

            try {
                const urlObject = new URL(imageUrl);
                await this.bot.api.sendPhoto(this.channelId, new InputFile(urlObject), {
                    caption: caption,
                    parse_mode: 'MarkdownV2',
                });
                
            } catch (error) {
                if (error instanceof TypeError && error.code === 'ERR_INVALID_URL') {
                     console.error(`${imageUrl}`, error);
                } else if (error.response && error.response.body) {
                     console.error(error.description, error.parameters);
                } else {
                     console.error(error);
                }
            }
        } else {
            console.error('dead image');
        }
    }

    startSending() {
        if (this.intervalId) {
            console.warn('Func startSending started...');
            return;
        }
        console.log(`CFG:: ${SEND_INTERVAL_MS / 1000} sec.`);
        this.sendImageToChannel();
        this.intervalId = setInterval(this.sendImageToChannel, SEND_INTERVAL_MS);
    }

    stopSending() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Send func stop.');
        } else {
            console.warn('Send func is not started.');
        }
    }
}

try {
    const token = process.env.TELEGRAM_TOKEN;
    const channelId = process.env.CHANNEL_ID;

    const imageBot = new ImageSenderBot(token, channelId);
    imageBot.startSending();

    console.log('Runing');

    process.once('SIGINT', () => {
        console.log('SIGINT. Stoping...');
        imageBot.stopSending();
        process.exit(0);
    });
    process.once('SIGTERM', () => {
        console.log('SIGTERM. Stoping...');
        imageBot.stopSending();
        process.exit(0);
    });

} catch (error) {
    console.error('Ишак, опять ошибка:', error.message);
    process.exit(1);
}
