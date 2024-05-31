const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "7082666685:AAHRnpqAklkf5sTa6NU2X-HGClls3X1_mnU"; // Thay thế bằng token của bạn
const server = express();
const bot = new TelegramBot(TOKEN, {
    polling: true
});
const port = process.env.PORT || 5000;
const gameName = "gjb";
const queries = {};

server.use(express.static(path.join(__dirname, 'grbotairdop')));

bot.onText(/help/, (msg) => {
    bot.sendMessage(msg.from.id, "Say /game if you want to play.");
});

bot.onText(/start|game/, (msg) => {
    bot.sendGame(msg.from.id, gameName);
});

bot.on("callback_query", (query) => {
    if (query.game_short_name !== gameName) {
        bot.answerCallbackQuery(query.id, { text: "Sorry, '" + query.game_short_name + "' is not available.", show_alert: true })
            .catch((error) => console.error('Error answering callback query:', error));
    } else {
        queries[query.id] = query;
        let gameurl = "https://grbotairdop.vercel.app/";
        bot.answerCallbackQuery(query.id, { url: gameurl })
            .catch((error) => console.error('Error answering callback query:', error));
    }
});

bot.on("inline_query", (iq) => {
    bot.answerInlineQuery(iq.id, [{
        type: "game",
        id: "0",
        game_short_name: gameName
    }]).catch((error) => console.error('Error answering inline query:', error));
});

server.get("/highscore/:score", (req, res, next) => {
    const queryId = req.query.id;
    if (!queries.hasOwnProperty(queryId)) return next();
    let query = queries[queryId];
    let options;
    if (query.message) {
        options = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id
        };
    } else {
        options = {
            inline_message_id: query.inline_message_id
        };
    }
    bot.setGameScore(query.from.id, parseInt(req.params.score), options)
        .then((result) => res.send({ success: true, result }))
        .catch((error) => {
            console.error('Error setting game score:', error);
            res.send({ success: false, error });
        });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
