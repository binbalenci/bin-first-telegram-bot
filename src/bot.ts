import 'dotenv/config'
import { Bot, Context, InlineKeyboard } from "grammy";


// Get the token from .env file
const token = process.env.TELEGRAM_BOT_TOKEN || "";

//Create a new bot
const bot = new Bot(token);

const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/yo - Be greeted by me
/effect [text] - Show a keyboard to apply text effects to [text]`;

// Context (`ctx`): This object encapsulates the details of an incoming Telegram update, such as messages or commands, and provides convenient methods for bot response and interaction. It simplifies access to both the message content and Telegram Bot API, streamlining the handling of user interactions.
// const replyWithIntro = (ctx: Context) =>
//   ctx.reply(introductionMessage, {
//     parse_mode: "HTML",
//   });

const aboutUrlKeyboard = new InlineKeyboard().url(
  "Host your own bot for free.",
  "https://cyclic.sh/"
);

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    reply_markup: aboutUrlKeyboard,
    parse_mode: "HTML",
  });

/* `bot.command("start", replyWithIntro);` is registering a command handler for the "/start" command.
When a user sends the "/start" command to the bot, the `replyWithIntro` function will be called, and
the bot will reply with the introduction message. */
bot.command("start", replyWithIntro);

/* Handler for command `yo` */
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.first_name}!`));

// Keep this at the bottom of the file
// bot.on("message", replyWithIntro);

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);


/* `bot.start();` is starting the bot and making it ready to receive and handle incoming messages and
events. Once this method is called, the bot will start listening for updates from Telegram and
respond accordingly. */
bot.start();