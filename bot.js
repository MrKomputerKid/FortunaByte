const { Client, Intents, Collector } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Load environment variables for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const guildId = process.env.DISCORD_GUILD_ID;

client.once('ready', async () => {
  try {
    const commands = [
      {
        name: 'blackjack',
        description: 'Play Blackjack'
      },
      {
        name: 'roulette',
        description: 'Play Roulette'
      },
      {
        name: 'poker',
        description: 'Play Poker'
      }
    ];

    const guild = await client.guilds.fetch(guildId);
    await guild.commands.set(commands);

    console.log('Slash commands registered successfully!');
    console.log('Ready!')
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

const blackjack = require('./blackjack');
const roulette = require('./roulette');
const poker = require('./poker');


client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'blackjack') {
    const blackjackCollectors = await blackjack.playBlackjack(interaction);
    await blackjack.playBlackjack(interaction, blackjackCollectors)
  } else if (commandName === 'roulette') {
    const rouletteCollectors = await roulette.playRoulette(interaction);
    await roulette.playRoulette(interaction);
  } else if (commandName === 'poker') {
    const pokerCollectors = await poker.playPoker(interaction);
    await poker.playPoker(interaction);
  }
});

// Retrieve bot token from environment variable
const token = process.env.DISCORD_BOT_TOKEN;

client.login(token);
