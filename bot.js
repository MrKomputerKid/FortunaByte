// bot.js
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const blackjack = require('./blackjack');
const roulette = require('./roulette');
const poker = require('./poker');

// Register slash commands
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
  
      const guild = await client.guilds.fetch('YOUR_GUILD_ID');
      await guild.commands.set(commands);
      
      console.log('Slash commands registered successfully!');
    } catch (error) {
      console.error('Error registering slash commands:', error);
    }
  });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'blackjack') {
    await blackjack.playBlackjack(interaction);
  } else if (commandName === 'roulette') {
    await roulette.playRoulette(interaction);
  } else if (commandName === 'poker') {
    await poker.playPoker(interaction);
  }
});

// Retrieve bot token from environment variable
const token = process.env.DISCORD_BOT_TOKEN;

client.login(token);