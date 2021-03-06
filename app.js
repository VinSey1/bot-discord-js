const GitHub = require('github-api');

const { Client, RichEmbed } = require('discord.js');
const client = new Client();
const settings = require('./settings.json');
var compteGit = new GitHub();
var fs = require ('fs');

client.on('ready', () => {
    console.log('Je suis en ligne !');
    client.user.setActivity(settings.prefix + 'help');
});

client.on('message', message => {
    if(message.content.startsWith(settings.prefix)){
        traiterMessage(message);
    }
});

client.on('messageDelete', message => {
    if(message.guild != null && !(message.content.startsWith(settings.prefix)) && message.author.id != settings.id && message.content != ''){
        fs.readFile('listlogs.txt', function (err, data) {
            if (err) throw err;
            if(data.indexOf(message.channel.guild.id) >= 0){
                logSuprMessage(message, data);
            }
        });
    }
});

client.on('messageUpdate', (ancienMessage, nouveauMessage) => {
    if(ancienMessage.guild != null && !(ancienMessage.content.startsWith(settings.prefix)) && ancienMessage.content != nouveauMessage.content
        && ancienMessage.author.id != settings.id) {
        fs.readFile('listlogs.txt', function (err, data) {
            if (err) throw err;
            if(data.indexOf(ancienMessage.channel.guild.id) >= 0){
                logModifMessage(ancienMessage, nouveauMessage, data);
            }
        });
    }
});

client.on('channelDelete', function(channel){
    fs.readFile('listlogs.txt', function (err, data) {
        if (err) throw err;
        //if(data.indexOf(channel.guild.id) >= 0){
            if(data.indexOf(channel.guild.id + ':' + channel.id + '\n') >= 0){
                var content = data.toString();
                content = content.replace(channel.guild.id + ':' + channel.id + '\n', '');
                fs.writeFile('listlogs.txt', content, function (err) {
                    if(err) throw err
                });
            } /*else {
                logChanSupr(channel, data);
            }*/
        //}
    });
});

/*
function logChanSupr(channel, data){
    var listlogs = data.toString().split('\n');;
    var chan = null;
    listlogs.every(ligne => {
        var content = ligne.split(':');
        if (content[0] == channel.guild.id){
            chan =  channel.guild.channels.get(content[1]);
            return false;
        } else {
            return true;
        }
    })
    chan.send({embed: {
        color: 3447003,
        title: '',
        author: {
            name: 'Channel ' + channel.name + ' supprimé',
            icon_url: client.user.avatarURL
        },
        description: '',
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
            text: '© ' + client.user.username
        }
    }
    });
}
*/
function logModifMessage(ancienMessage, nouveauMessage, data){
    var listlogs = data.toString().split('\n');;
    var chan = null;
    listlogs.every(ligne => {
        var content = ligne.split(':');
        if (content[0] == ancienMessage.guild.id){
            chan =  ancienMessage.guild.channels.get(content[1]);
            return false;
        } else {
            return true;
        }
    })
    chan.send({embed: {
        color: 3066993,
        title: '',
        author: {
            name: 'Message modifié de ' + ancienMessage.author.username + ' dans #' + ancienMessage.channel.name,
            icon_url: ancienMessage.author.avatarURL
        },
        description: '',
        fields: [{
            name: 'Ancien message',
            value: ancienMessage.content
        },
        {
            name: 'Nouveau message',
            value: nouveauMessage.content
        }],
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
            text: '© ' + client.user.username
        }
    }
    });
}

function logSuprMessage(message, data){
    var listlogs = data.toString().split('\n');;
    var chan = null;
    listlogs.every(ligne => {
        var content = ligne.split(':');
        if (content[0] == message.guild.id){
            chan =  message.guild.channels.get(content[1]);
            return false;
        } else {
            return true;
        }
    })
    chan.send({embed: {
        color: 15158332,
        title: '',
        author: {
            name: 'Message supprimé de ' + message.author.username +' dans #' + message.channel.name,
            icon_url: message.author.avatarURL
        },
        description: message.content,
        timestamp: new Date(),
        footer: {
            icon_url: client.user.avatarURL,
            text: '© ' + client.user.username
        }
    }
    });
}

function traiterMessage(message) {
    contenuMessage = message.content.replace(settings.prefix, '');
    /*if(contenuMessage.startsWith('git-')){
        gestionnaireGit(contenuMessage, message);
    }*/
    if(contenuMessage.startsWith('logs-') && message.guild != null && message.member.hasPermission('ADMINISTRATOR')){
        gestionnaireLogs(contenuMessage, message);
    }
    if(contenuMessage == 'help'){
        message.author.send({embed: {
                color: 15158332,
                title: 'Manuel d\'aide de ' + client.user.username,
                author: {
                    name: '',
                    icon_url: ''
                },
                description: 'Si jamais vous souhaitez ajouter le bot sur votre serveur, merci de suivre [ce lien](https://discordapp.com/oauth2/authorize?client_id=' + settings.id + '&scope=bot&permissions=' + settings.permissions + ').' ,
                fields: [{
                    name: 'Logs',
                    value: '`' + settings.prefix + 'logs-enable` : Active les logs du serveur dans le channel actuel (messages supprimés/modifiés).\n' +
                        '`' + settings.prefix + 'logs-disable` : Désactive les logs du serveur (à utiliser dans le channel où les logs sont activés).\n' +
                        '\:warning: **Supprimer le channel où les logs sont activés désactive le suivi des logs.** \:warning:'
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: '© ' + client.user.username
                }
            }
            });
    }
    if(message.guild != null){
        message.delete();
    }
}

function gestionnaireLogs(contenuMessage, message){
    contenuMessage = contenuMessage.replace('logs-', '');
    if(contenuMessage.startsWith('enable')){
        fs.readFile('listlogs.txt', function (err, data) {
            if (err) throw err;
            if(data.indexOf(message.channel.guild.id) < 0){
                fs.appendFile('listlogs.txt', message.channel.guild.id + ':' + message.channel.id + '\n', function (err) {
                    if (err) throw err;
                })
                message.channel.send('Fonction des logs activée.');
            } else {
                message.channel.send('Les logs sont déjà activés sur ce serveur.\n' + 
                    'Si vous voulez changer le channel de logs, désactivez les logs via la commande **' + settings.prefix + 'logs-disable** ' +
                    'et réactivez-les dans le channel souhaité.');
            }
        });
    }
    if(contenuMessage.startsWith('disable')){
        fs.readFile('listlogs.txt', function (err, data) {
            if (err) throw err;
            if(data.indexOf(message.channel.guild.id + ':' + message.channel.id + '\n') >= 0){
                var content = data.toString();
                content = content.replace(message.channel.guild.id + ':' + message.channel.id + '\n', '');
                fs.writeFile('listlogs.txt', content, function (err) {
                    if(err) throw err
                });
                message.channel.send('Fonction des logs désactivée.');
            } else {
                if(data.indexOf(message.channel.guild.id) >= 0){
                    message.channel.send('Veuillez utiliser cette commande dans le channel des logs.');
                } else {
                    message.channel.send('Les logs ne sont pas activés sur ce serveur.\n' + 
                    'Si vous voulez activer les logs, activez-les dans le channel voulu via la commande **' + settings.prefix + 'logs-enable**.');
                }
            }
        });
    }
}

/*
function gestionnaireGit(contenuMessage, message){
    contenuMessage = contenuMessage.replace('git-', '');
    if(contenuMessage.startsWith('repos')){
        var token = contenuMessage.split(':');
        compteGit.getUser(token[1]).listRepos(function(err, repos) {
            if(repos == null){
                message.channel.send('Pas de répertoires publiques associés à cet utilisateur.');
            } else {
                var repertoires = '';
                repos.forEach(element => {
                    repertoires = repertoires + element.name + '\n';
                });
                message.channel.send('Répertoires de l\'utilisateur ' + token[1] + ' : \n```' + repertoires + '```');
            }
        });
    }
}*/

client.login(settings.token);