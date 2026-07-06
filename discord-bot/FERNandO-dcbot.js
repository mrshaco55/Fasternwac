const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits, 
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

let isSpamRunning = false;
let ticketConfigs = {};

const slashCommands = [
    new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Botun tüm komutlarını listeler.'),
    new SlashCommandBuilder()
        .setName('bilgi')
        .setDescription('Botun tüm komutlarını ve bilgilerini listeler.'),
    new SlashCommandBuilder()
        .setName('atatürk')
        .setDescription('🇹🇷 Ulu Önder Mustafa Kemal Atatürk\'ün sözünü ve görselini paylaşır.'),
    new SlashCommandBuilder()
        .setName('espri')
        .setDescription('🃏 Bot rastgele komik/soğuk bir espri patlatır.'),
    new SlashCommandBuilder()
        .setName('aşkölçer')
        .setDescription('❤️ Belirtilen iki kişi arasındaki aşk oranını ölçer.')
        .addUserOption(option => option.setName('kişi1').setDescription('İlk kişiyi etiketleyin.').setRequired(true))
        .addUserOption(option => option.setName('kişi2').setDescription('İkinci kişiyi etiketleyin.').setRequired(true))
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
    console.log(`${client.user.tag} olarak giriş yapıldı! Bot aktif.`);
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands });
        console.log('Tüm modern slash komutları başarıyla yüklendi!');
    } catch (error) {
        console.error('Slash yüklenirken hata oluştu:', error);
    }
});

function createHelpEmbed() {
    return new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('⚙️ FERNandO Bot Komut Listesi')
        .setDescription('Botumuzun kullanabileceğiniz tüm komutları aşağıda listelenmiştir.')
        .addFields(
            { name: '👋 Genel Komutlar', value: '`f!sa` - Bot selamınızı alır.' },
            { name: '❤️ Eğlence Komutları', value: '`/aşkölçer @kişi1 @kişi2` - İki üye arasındaki aşkı ölçer.\n`/espri` - Rastgele 10 espriden birini atar.\n`/atatürk` - Rastgele bir sözüyle Atamızı anar. 🇹🇷' }
        )
        .setFooter({ text: 'FERNandO Yönetim Sistemi' })
        .setTimestamp();
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        if (commandName === 'yardım' || commandName === 'bilgi') {
            const embed = createHelpEmbed();
            await interaction.reply({ embeds: [embed] });
        }
        if (commandName === 'atatürk') {
            const sozler = [
                "\"Ne mutlu Türk'üm diyene!\"",
                "\"İstikbal göklerdedir.\"",
                "\"Hayatta en hakiki mürşit ilimdir.\""
            ];
            const rastgeleSoz = sozler[Math.floor(Math.random() * sozler.length)];
            const ataEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🇹🇷 Mustafa Kemal Atatürk')
                .setDescription(`**${rastgeleSoz}**\n\nSaygı, sevgi, minnet ve özlemle anıyoruz...`)
                .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Ataturk1930s.jpg/250px-Ataturk1930s.jpg')
                .setFooter({ text: 'FERNandO Saygı Köşesi' })
                .setTimestamp();
            await interaction.reply({ embeds: [ataEmbed] });
        }
        if (commandName === 'espri') {
            const espriler = [
                "Geçen gün taksi çevirdim, hala dönüyor. 🚕",
                "Röntgen filmi çektirdik, yakında sinemalarda! 🎬",
                "Adamın biri gülmüş, saksıya dikmişler. 🌹"
            ];
            const rastgeleEspri = espriler[Math.floor(Math.random() * espriler.length)];
            const espriEmbed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle('🃏 FERNandO Espri Kutusu')
                .setDescription(rastgeleEspri)
                .setTimestamp();
            await interaction.reply({ embeds: [espriEmbed] });
        }
        if (commandName === 'aşkölçer') {
            await interaction.deferReply();
            const k1 = interaction.options.getUser('kişi1');
            const k2 = interaction.options.getUser('kişi2');
            const oran = Math.floor(Math.random() * 101);
            const kalpSayisi = Math.round(oran / 10);
            const temizBar = "❤️".repeat(kalpSayisi) + "🖤".repeat(10 - kalpSayisi);
            const askEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('💘 FERNandO AşkÖlçer')
                .setDescription(`**${k1}** ile **${k2}** arasındaki aşk derecesi ölçüldü!`)
                .addFields(
                    { name: `Aşk Oranı: %${oran}`, value: `${temizBar}` }
                )
                .setTimestamp();
            await interaction.editReply({ embeds: [askEmbed] });
        }
    }
    if (interaction.isButton()) {
        if (interaction.customId === 'create_ticket_btn') {
            await interaction.reply({ content: '🎫 Ticket oluşturuldu!', ephemeral: true });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith('f!')) return;
    const args = message.content.slice(2).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'sa') return message.reply('Aleykümselam, hoş geldin! 👋');
});

client.login('discord-token-buraya-gir');