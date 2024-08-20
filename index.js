const { WebhookClient } = require('discord.js');
const chalk = require('chalk');

class MakimaAntiCrash {
    constructor(client, webhookUrl = null, options = {}) {
        this.client = client;
        this.webhookUrl = options.webhookUrl || webhookUrl;
        this.webhook = this.webhookUrl ? new WebhookClient({ url: this.webhookUrl }) : null;

        // Modular options
        this.maxEmbedLength = options.maxEmbedLength || 4096;
        this.disableConsoleLogging = options.disableConsoleLogging || false;
        this.disableWebhookLogging = options.disableWebhookLogging || !this.webhookUrl;

        this.embedColor = options.embedColor || 0x800000;
        this.testEmbedColor = options.testEmbedColor || 0xFF0000;
        this.errorTitle = options.errorTitle || "🩸 Error Occurred";
        this.warningTitle = options.warningTitle || "⚠️ Warning";
        this.testTitle = options.testTitle || "Makima's Embrace";
        this.testDescription = options.testDescription || "My dear pet, I've wrapped you in my protective aura. Feel safe in my arms as I shield you from the chaos.";

        this.footerText = options.footerText || "Makima's gaze pierces through chaos...";
        this.testFooterText = options.testFooterText || "Your eternal contract is sealed...";

        // Initialize the anti-crash system
        this.setupAntiCrash();
    }

    setupAntiCrash() {
        process.on('unhandledRejection', this.handleError.bind(this, 'Unhandled Rejection'));
        process.on('uncaughtException', this.handleError.bind(this, 'Uncaught Exception'));
        process.on('uncaughtExceptionMonitor', this.handleError.bind(this, 'Uncaught Exception Monitor'));

        this.client.on('error', this.handleError.bind(this, 'Discord Client Error'));
        this.client.on('warn', this.handleWarning.bind(this));
        this.client.on('disconnect', this.handleDisconnect.bind(this));
        this.client.on('reconnecting', this.handleReconnecting.bind(this));

        if (!this.disableConsoleLogging) {
            console.log(chalk.redBright("Makima's protective embrace envelops you... AntiCrash activated."));
        }
        this.sendTestWebhook();
    }

    async handleError(type, error) {
        const errorText = error.stack || error.toString();
        const embeds = this.createErrorEmbeds(type, errorText);

        if (!this.disableConsoleLogging) {
            console.error(chalk.red.bold(`[Makima's Wrath] ${type}:`), chalk.red(error));
            if (this.client.logger) {
                this.client.logger.error(`${type}: ${error.stack || error}`);
            }
        }

        if (!this.disableWebhookLogging && this.webhook) {
            try {
                for (const embed of embeds) {
                    await this.webhook.send({ embeds: [embed] });
                }
            } catch (webhookError) {
                console.error(chalk.red.bold('Failed to send Makima\'s message:'), chalk.red(webhookError));
            }
        }
    }

    handleWarning(warning) {
        if (!this.disableConsoleLogging) {
            console.warn(chalk.keyword('orange').bold(`[Makima's Whisper] ${this.warningTitle}:`), chalk.keyword('orange')(warning));
            if (this.client.logger) {
                this.client.logger.warn(`Warning: ${warning}`);
            }
        }
    }

    handleDisconnect(event) {
        if (!this.disableConsoleLogging) {
            console.log(chalk.red.bold('[Makima\'s Absence] Bot disconnected:'), chalk.red(event));
            if (this.client.logger) {
                this.client.logger.info(`Bot disconnected: ${JSON.stringify(event)}`);
            }
        }
    }

    handleReconnecting() {
        if (!this.disableConsoleLogging) {
            console.log(chalk.red.bold('[Makima\'s Return] Bot reconnecting...'));
            if (this.client.logger) {
                this.client.logger.info('Bot reconnecting...');
            }
        }
    }

    createErrorEmbeds(type, errorText) {
        const embeds = [];
        const chunks = this.chunkString(errorText, this.maxEmbedLength);

        for (const chunk of chunks) {
            embeds.push({
                color: this.embedColor,
                title: `🩸 ${type}`,
                description: `\`\`\`${chunk}\`\`\``,
                footer: { text: this.footerText },
                timestamp: new Date()
            });
        }

        return embeds;
    }

    chunkString(str, length) {
        return str.match(new RegExp(`.{1,${length}}`, 'g'));
    }

    async sendTestWebhook() {
        if (!this.disableWebhookLogging && this.webhook) {
            const testEmbed = {
                color: this.testEmbedColor,
                title: this.testTitle,
                description: this.testDescription,
                footer: { text: this.testFooterText },
                timestamp: new Date()
            };

            try {
                await this.webhook.send({ embeds: [testEmbed] });
                if (!this.disableConsoleLogging) {
                    console.log(chalk.redBright("Makima's test message whispered successfully..."));
                }
            } catch (error) {
                console.error(chalk.red.bold('Failed to send Makima\'s test message:'), chalk.red(error));
            }
        }
    }

    // Method to trigger a manual test error
    triggerTestError() {
        throw new Error("This is a test error triggered manually.");
    }

    // Method to trigger a manual test warning
    triggerTestWarning() {
        this.client.emit('warn', "This is a test warning triggered manually.");
    }
}

module.exports = MakimaAntiCrash;
