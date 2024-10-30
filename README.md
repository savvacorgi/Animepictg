# Anime Picture Bot

A Telegram bot that fetches and sends images from a specified API to a Telegram channel.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [For Arch Linux](#for-arch-linux)
  - [For Ubuntu / Debian](#for-ubuntu--debian)
  - [For Termux](#for-termux)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Features

- Fetch images from an external API.
- Send images with captions to a Telegram channel.
- Commands to control bot behavior (e.g., stop the bot).

## Installation

Follow these instructions to set up the project on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine. If you haven't installed it yet, follow the steps below for your operating system.

### For Arch Linux

```bash
sudo pacman -Sy
sudo pacman -S nodejs npm git
```
### For Ubuntu / Debian

```bash
sudo apt update
sudo apt install nodejs npm git
```
### For Termux

```bash
pkg update
pkg install nodejs git
```
### Install repository
```bash
git clone https://github.com/savvacorgi/Animepictg.git
cd Animepictg
npm install
```
## Usage

To run the bot, use the following command:
```bash
npm run start
```
Make sure your environment variables are correctly set in the `.env` file.

## Environment Variables

Create a `.env` file in the project root and add the following variables:

TELEGRAM_TOKEN=your_telegram_bot_token
CHANNEL_ID=@your_channel_id

Replace `your_telegram_bot_token` with your actual Telegram bot token and `@your_channel_id` with the desired channel ID.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Libare

- [node-telegram-bot-api](https://github.com/nukosuke/node-telegram-bot-api) for providing the Telegram Bot API.
- [node-fetch](https://github.com/node-fetch/node-fetch) for fetching data from the API.
