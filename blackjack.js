const Discord = require('discord.js');
  module.exports = {
    playBlackjack: async function(interaction) {
      const playerHand = [];
      const dealerHand = [];

      // Function to calculate hand value
      function calculateHandValue(hand) {
        let sum = 0;
        let hasAce = false;
        for (const card of hand) {
          if (card === 'A') {
            hasAce = true;
          } else if (['J', 'Q', 'K'].includes(card)) {
            sum += 10;
          } else {
            sum += parseInt(card);
          }
        }
        if (hasAce && sum + 11 <= 21) {
          sum += 11;
        } else {
          sum += hand.filter(card => card === 'A').length;
        }
        return sum;
      }

      // Function to deal initial cards
      function dealInitialCards() {
        for (let i = 0; i < 2; i++) {
          playerHand.push(getRandomCard());
          dealerHand.push(getRandomCard());
        }
      }

      // Function to get a random card
      function getRandomCard() {
        const cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return cards[Math.floor(Math.random() * cards.length)];
      }

      // Function to create and update the embed
      async function updateEmbed(sentMessage) {
        const embed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Blackjack')
          .addField('Player Hand', playerHand.join(', '))
          .addField('Player Hand Value', calculateHandValue(playerHand))
          .addField('Dealer Hand', `${dealerHand[0]}, ?`);

        await sentMessage.edit({ embeds: [embed] });
      }

      // Deal initial cards
      dealInitialCards();

      // Send initial embed
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Blackjack')
        .addField('Player Hand', playerHand.join(', '))
        .addField('Player Hand Value', calculateHandValue(playerHand))
        .addField('Dealer Hand', `${dealerHand[0]}, ?`);

      const sentMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

      // Update embed with current game state
      await updateEmbed(sentMessage);
    }
  };