// blackjack.js
const Discord = require('discord.js');

// Global error handler
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', reason);
});

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
      return sum.toString(); // Ensure that the value is converted to a string
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

      try {
        const message = await sentMessage.edit({ embeds: [embed] });
        await message.react('👊'); // Add hit reaction
        await message.react('✋'); // Add stand reaction
      } catch (error) {
        console.log('Error updating embed:', error);
      }

      // Collect reactions
      const filter = (reaction, user) => ['👊', '✋'].includes(reaction.emoji.name) && user.id === interaction.user.id;
      const collector = await sentMessage.createReactionCollector({ filter, time: 60000 });
      
      collector.on('collect', async (reaction, user) => {
        try {
          if (reaction.emoji.name === '👊') {
            // Handle hit action
            playerHand.push(getRandomCard());
            await updateEmbed(sentMessage);
            const playerHandValue = calculateHandValue(playerHand);
            if (playerHandValue === 21) {
              collector.stop('Blackjack');
            } else if (playerHandValue > 21) {
              collector.stop('Bust');
            }
          } else if (reaction.emoji.name === '✋') {
            // Handle stand action
            collector.stop('Stand');
          }
        } catch (error) {
          console.log('Error handling reaction:', error);
        }
      });

      collector.on('end', async (collected, reason) => {
        try {
          if (reason === 'Bust') {
            // Handle bust
            await interaction.followUp('You busted! Dealer wins.');
          } else if (reason === 'Stand') {
            // Handle stand
            await revealDealerHand();
            const dealerHandValue = calculateHandValue(dealerHand);
            while (dealerHandValue < 17) {
              dealerHand.push(getRandomCard());
              await updateEmbed(sentMessage);
              const dealerHandValue = calculateHandValue(dealerHand);
            }
            determineWinner();
          } else if (reason === 'Blackjack') {
            // Handle blackjack
            await interaction.followUp('Blackjack! You win!');
          } else {
            // Handle timeout
            await interaction.followUp('You took too long to respond.');
          }
        } catch (error) {
          console.log('Error handling collector end:', error);
        }
      });
    }

    // Function to reveal dealer's hand
    async function revealDealerHand() {
      const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Blackjack')
        .addFields('Player Hand', playerHand.join(', '))
        .addFields('Player Hand Value', calculateHandValue(playerHand))
        .addFields('Dealer Hand', dealerHand.join(', '));

      try {
        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.log('Error revealing dealer hand:', error);
      }
    }

    // Function to determine the winner
    async function determineWinner() {
      try {
        const playerHandValue = calculateHandValue(playerHand);
        const dealerHandValue = calculateHandValue(dealerHand);

        if (playerHandValue > 21) {
          await interaction.followUp('You busted! Dealer wins.');
        } else if (dealerHandValue > 21) {
          await interaction.followUp('Dealer busted! You win.');
        } else if (playerHandValue > dealerHandValue) {
          await interaction.followUp('You win!');
        } else if (playerHandValue < dealerHandValue) {
          await interaction.followUp('Dealer wins.');
        } else {
          await interaction.followUp('It\'s a tie!');
        }
      } catch (error) {
        console.log('Error determining winner:', error);
      }
    }

    // Deal initial cards
    dealInitialCards();

    // Send initial embed
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Blackjack')
      .addFields('Player Hand', playerHand.join(', '))
      .addFields('Player Hand Value', calculateHandValue(playerHand))
      .addFields('Dealer Hand', `${dealerHand[0]}, ?`);

    try {
      const sentMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
      // Update embed with current game state
      await updateEmbed(sentMessage);
    } catch (error) {
      console.log('Error replying to interaction:', error);
    }
  }
};
