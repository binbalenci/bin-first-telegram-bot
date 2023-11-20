import 'dotenv/config'
import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";


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

/* `bot.command("start", replyWithIntro);` is registering a command handler for the "/start" command.
When a user sends the "/start" command to the bot, the `replyWithIntro` function will be called, and
the bot will reply with the introduction message. */
bot.command("start", replyWithIntro);

/* Handler for command `yo` */
bot.command("yo", (ctx) => ctx.reply(`Hello Mắm ${ctx.from?.first_name}!`));

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

