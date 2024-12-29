# GitSwitcher (gs)

A command-line tool to manage multiple GitHub accounts easily. Switch between different GitHub accounts with simple commands.

## Table of Contents

- [Installation](#installation-as-a-global-npm-package)
- [Manual Installation](#manual-installation)
- [Usage](#usage)
- [Set up github multiple accounts](#set-up-github-multiple-accounts)

## Installation as a global npm package

```bash
npm install -g git-account-switcher
```

## Manual Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm link` to make the `gs` command available globally

## Usage

### Add a new GitHub account
```bash
gs add <email> <username>
```

### Edit an existing account
```bash
gs edit <no> <email> <username>
```

### Delete an account
```bash
gs del <no>
```

### Set active GitHub account
```bash
gs set <no>
```

### List all configured accounts
```bash
gs list
```

## Example

```bash
# Add a new account
gs add "work@example.com" "work-username"

# Add another account
gs add "personal@example.com" "personal-username"

# List all accounts
gs list

# Switch to account #1
gs set 1

# Edit account #2
gs edit 2 "new@example.com" "new-username"

# Delete account #1
gs del 1
```

## Set up github multiple accounts
Here is the [link](https://docs.github.com/en/authentication/managing-your-authentication-settings/managing-your-personal-access-tokens-for-github-apps) to set up multiple accounts.

## License

This project is licensed under the MIT License.
