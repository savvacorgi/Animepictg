import { Bot, InputFile } from 'grammy';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SEND_INTERVAL_MS = 30 * 1000;

class ImageSenderBot {
    constructor(token, channelId) {
        if (!token) {
            throw new Error('Отсутствует TELEGRAM_TOKEN в переменных окружения.');
        }
        if (!channelId) {
            throw new Error('Отсутствует CHANNEL_ID в переменных окружения.');
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
                console.error(`Ошибка загрузки изображения: HTTP статус ${error.response.status}`, error.response.data);
            } else if (error.request) {
                console.error('Ошибка загрузки изображения: Ответ не получен', error.request);
            } else {
                console.error('Ошибка загрузки изображения: Ошибка настройки запроса', error.message);
            }
            return null;
        }
    }

    formatCaption(imageData) {
        const escapeMdV2 = (text) => String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

        const author = imageData.author ? escapeMdV2(imageData.author) : 'Unknown';
        const sourceUrl = imageData.source && String(imageData.source).trim() ? imageData.source : '#';
        const sourceText = sourceUrl !== '#' ? 'Источник' : 'Источник не указан';

        let caption = `Author: ${author}\nFile: [image](${imageData.file_url})\n`;
        if (sourceUrl !== '#') {
            caption += `Source: [${sourceText}](${sourceUrl})`;
        } else {
            caption += sourceText;
        }
        return caption;
    }

    async sendImageToChannel() {
        console.log('Попытка загрузить и отправить изображение...');
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
                console.log(`Изображение успешно отправлено в канал ${this.channelId}`);
            } catch (error) {
                if (error instanceof TypeError && error.code === 'ERR_INVALID_URL') {
                     console.error(`Ошибка отправки фото: Не удалось создать валидный URL из "${imageUrl}"`, error);
                } else if (error.response && error.response.body) {
                     console.error('Ошибка отправки фото в Telegram (grammy):', error.description, error.parameters);
                } else {
                     console.error('Ошибка отправки фото в Telegram:', error);
                }
            }
        } else {
            console.error('Не удалось получить валидные данные изображения.');
        }
    }

    startSending() {
        if (this.intervalId) {
            console.warn('Процесс отправки уже запущен.');
            return;
        }
        console.log(`Запуск сервиса отправки изображений. Интервал: ${SEND_INTERVAL_MS / 1000} секунд.`);
        this.sendImageToChannel();
        this.intervalId = setInterval(this.sendImageToChannel, SEND_INTERVAL_MS);
    }

    stopSending() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Сервис отправки изображений остановлен.');
        } else {
            console.warn('Процесс отправки не запущен.');
        }
    }
}

try {
    const token = process.env.TELEGRAM_TOKEN;
    const channelId = process.env.CHANNEL_ID;

    const imageBot = new ImageSenderBot(token, channelId);
    imageBot.startSending();

    console.log('Бот инициализирован и процесс отправки запущен.');

    process.once('SIGINT', () => {
        console.log('Получен SIGINT. Остановка бота...');
        imageBot.stopSending();
        process.exit(0);
    });
    process.once('SIGTERM', () => {
        console.log('Получен SIGTERM. Остановка бота...');
        imageBot.stopSending();
        process.exit(0);
    });

} catch (error) {
    console.error('Ишак, опять ошибка:', error.message);
    process.exit(1);
}
