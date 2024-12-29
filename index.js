#!/usr/bin/env node

/*
Project Name: GitSwitcher (gs)
Version: 1.0.0
Author: 0xtbug
Date: 2024-12-29
License: MIT
*/

import { program } from 'commander';
import Conf from 'conf';
import { table } from 'table';
import { execSync } from 'child_process';

const config = new Conf({
    projectName: 'gitswitcher',
    encryptionKey: 'gs-secure-key',
    schema: {
        accounts: {
            type: 'array',
            default: []
        },
        currentAccount: {
            type: 'number',
            default: -1
        }
    }
});

const safeExecSync = (command) => {
    try {
        return execSync(command, { 
            encoding: 'utf8',
            timeout: 5000,
            maxBuffer: 1024 * 1024
        });
    } catch (error) {
        throw new Error(`Command execution failed: ${error.message}`);
    }
};

program
    .name('gs')
    .description('GitHub Account Switcher')
    .version('1.0.0');

program
    .command('add')
    .description('Add a new GitHub account')
    .argument('<email>', 'GitHub email')
    .argument('<username>', 'GitHub username')
    .action((email, username) => {
        try {
            const accounts = config.get('accounts');
            const no = accounts.length + 1;
            
            if (accounts.some(acc => acc.email === email || acc.username === username)) {
                console.error('Account with this email or username already exists');
                process.exit(1);
            }

            accounts.push({ no, email, username });
            config.set('accounts', accounts);
            console.log(`Added GitHub account #${no}`);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program
    .command('edit')
    .description('Edit a GitHub account')
    .argument('<no>', 'Account number')
    .argument('<email>', 'New email')
    .argument('<username>', 'New username')
    .action((no, email, username) => {
        try {
            const accounts = config.get('accounts');
            const accountNo = parseInt(no, 10);

            const index = accounts.findIndex(acc => acc.no === accountNo);
            if (index === -1) {
                throw new Error(`Account #${no} not found`);
            }

            if (accounts.some(acc => acc.no !== accountNo && (acc.email === email || acc.username === username))) {
                throw new Error('Account with this email or username already exists');
            }

            accounts[index] = { no: accountNo, email, username };
            config.set('accounts', accounts);
            console.log(`Updated GitHub account #${no}`);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program
    .command('del')
    .description('Delete a GitHub account')
    .argument('<no>', 'Account number')
    .action((no) => {
        try {
            const accounts = config.get('accounts');
            const accountNo = parseInt(no, 10);
            const index = accounts.findIndex(acc => acc.no === accountNo);

            if (index === -1) {
                throw new Error(`Account #${no} not found`);
            }

            accounts.splice(index, 1);
            accounts.forEach((acc, i) => acc.no = i + 1);
            
            const currentAccount = config.get('currentAccount');
            if (currentAccount === accountNo) {
                config.set('currentAccount', -1);
            } else if (currentAccount > accountNo) {
                config.set('currentAccount', currentAccount - 1);
            }
            
            config.set('accounts', accounts);
            console.log(`Deleted GitHub account #${no}`);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program
    .command('set')
    .description('Set active GitHub account')
    .argument('<no>', 'Account number')
    .action((no) => {
        try {
            const accounts = config.get('accounts');
            const accountNo = parseInt(no, 10);
            const account = accounts.find(acc => acc.no === accountNo);
            
            if (!account) {
                throw new Error(`Account #${no} not found`);
            }

            const escapedEmail = account.email.replace(/["\\]/g, '\\$&');
            const escapedUsername = account.username.replace(/["\\]/g, '\\$&');

            safeExecSync(`git config --global user.email "${escapedEmail}"`);
            safeExecSync(`git config --global user.name "${escapedUsername}"`);
            config.set('currentAccount', accountNo);
            console.log(`Switched to GitHub account #${no}`);
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program
    .command('list')
    .description('List all GitHub accounts')
    .action(() => {
        try {
            const accounts = config.get('accounts');
            const currentAccount = config.get('currentAccount');

            if (accounts.length === 0) {
                console.log('No GitHub accounts configured');
                return;
            }

            const tableConfig = {
                border: {
                    topBody: '─',
                    topJoin: '┬',
                    topLeft: '┌',
                    topRight: '┐',
                    bottomBody: '─',
                    bottomJoin: '┴',
                    bottomLeft: '└',
                    bottomRight: '┘',
                    bodyLeft: '│',
                    bodyRight: '│',
                    bodyJoin: '│',
                    joinBody: '─',
                    joinLeft: '├',
                    joinRight: '┤',
                    joinJoin: '┼'
                }
            };

            const data = [
                ['NO', 'EMAIL', 'USERNAME', 'ACTIVE'].map(header => `\x1b[1m${header}\x1b[0m`)
            ];

            accounts.forEach(acc => {
                data.push([
                    acc.no.toString(),
                    acc.email,
                    acc.username,
                    acc.no === currentAccount ? '\x1b[32m✓\x1b[0m' : ''
                ]);
            });

            console.log(table(data, tableConfig));
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

program.parse();
