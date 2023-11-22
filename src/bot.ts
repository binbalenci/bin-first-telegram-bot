import 'dotenv/config'
import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";
import axios from "axios";


// Get the token from .env file
const token = process.env.TELEGRAM_BOT_TOKEN || "";

//Create a new bot
const bot = new Bot(token);

const introductionMessage = `Hello! I'm a Telegram bot.

<b>Commands</b>
/yo - Be greeted by me
/effect [text] - Show a keyboard to apply text effects to [text]`;

// Context (`ctx`): This object encapsulates the details of an incoming Telegram update, such as messages or commands, and provides convenient methods for bot response and interaction. It simplifies access to both the message content and Telegram Bot API, streamlining the handling of user interactions.
// const replyWithIntro = (ctx: Context) =>
//   ctx.reply(introductionMessage, {
//     parse_mode: "HTML",
//   });

const aboutUrlKeyboard = new InlineKeyboard().url(
  " © 2023 Bin Balenci. All rights Reserved.",
  "https://binbalenci.com/"
);

const replyWithIntro = (ctx: Context) =>
  ctx.reply(introductionMessage, {
    reply_markup: aboutUrlKeyboard,
    parse_mode: "HTML",
  });

let kamuPayload = {
  "command": "POST",
  "type": "text",
  "value": "My place in queue",
  "conversation_id": "123",
  "filter_values": [
    "migri",
    "english_start_language"
  ],
  "client_timezone": "Europe/Helsinki"
}
const today = new Date().toLocaleDateString('en-GB').split('/').join('.');

async function fetchPositionFromMigri(diaryNumber: string) {
  const url = "https://networkmigri.boost.ai/api/chat/v2";

  try {
    const response = await axios.post(url, kamuPayload);

    if (response.data.conversation?.id) {
      const newResponse1 = await axios.post(url, {
        ...kamuPayload,
        conversation_id: response.data.conversation.id
      });

      if (newResponse1.data.response?.elements?.[0]?.payload?.html.includes("Enter your diary number like this")) {
        const newResponse2 = await axios.post(url, {
          ...kamuPayload,
          conversation_id: response.data.conversation.id,
          value: diaryNumber
        })

        return newResponse2.data.response?.elements?.[1]?.payload?.json?.data?.counterValue;
      }

    } else {
      throw new Error("No conversation id");
    }

    return response.data; // Return the fetched data
  } catch (error) {
    throw error; // Rethrow the error for handling in the caller
  }
}


/* `bot.command("start", replyWithIntro);` is registering a command handler for the "/start" command.
When a user sends the "/start" command to the bot, the `replyWithIntro` function will be called, and
the bot will reply with the introduction message. */
bot.command("start", replyWithIntro);

/* Handler for command `yo` */
bot.command("yo", (ctx) => ctx.reply(`Hello Mắm ${ctx.from?.first_name}!`));

bot.command('queue', async (ctx) => {
  const diaryNumber = ctx.message.text.split(' ')[1];

  try {
    // Replace 'YOUR_URL' with the actual URL
    const data = await fetchPositionFromMigri(diaryNumber);
    await ctx.reply(`Date: ${today}. The queue for the diary number ${diaryNumber} is ${data}`);
  } catch (error) {
    await ctx.reply(`Error: ${error.message}`);
  }
});

// Keep this at the bottom of the file
// bot.on("message", replyWithIntro);

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
]);

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}

