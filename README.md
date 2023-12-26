# Geshin Impact Express

This is Section B `Fantasy Adventures` Theme game.

- [Geshin Impact Express](#geshin-impact-express)
  - [Setup](#setup)
  - [Database Initialization \& Add Data](#database-initialization--add-data)
  - [Endpoints](#endpoints)
    - [Login / Signup](#login--signup)
    - [Gacha](#gacha)
    - [Inventory](#inventory)
    - [Upgrade](#upgrade)
    - [Quest](#quest)
    - [Party (Team creation)](#party-team-creation)
    - [Combat System](#combat-system)
  - [References](#references)

## Setup

To set up environment variables for your Express.js application, follow these steps:

1. Create a file named `.env` in the root directory of your project.
2. Open the `.env` file and add the following lines:

   ```
   DB_HOST=<your_database_host>
   DB_USER=<your_database_user>
   DB_PASSWORD=<your_database_password>
   DB_DATABASE=<your_database_name>
   ```

   Replace `<your_database_host>`, `<your_database_user>`, `<your_database_password>`, and `<your_database_name>` with the appropriate values for your database connection.
   For example:

   ```
   DB_HOST=localhost
   DB_USER=myuser
   DB_PASSWORD=mypassword
   DB_DATABASE=ca1bed
   ```

   Note: Make sure there are no spaces around the equal sign (=) in each line.

3. Save the `.env` file.

## Database Initialization & Add Data

1. To initialize the database tables and populate them with sample data, open the terminal in VSCode and run the following command:

   ```
   npm run init_tables
   ```

## Endpoints

### Login / Signup

- **Endpoint** : `POST > game/login`
- **Request** :

  ```json
  {
    "name": "<your_game_name>",
    "username": "<from_users_table>",
    "email": "<from_users_table>"
  }
  ```

- Response New Player :
  ```json
  {
    "message": "Welcome <your_game_name>",
    "primogems": "💎<amount>"
  }
  ```
- Response Old Player :

  ```json
  {
    "message": "Welcome <your_game_name>",
    "primogems": "💎<amount>"
  }
  ```

  > **Note**: username & email must exist in `users` table

### Gacha

Spend primogems as virtual currency to get `character(s)`. Each character have different types of rarity. Only `5star` & `4star` can be obtained through `gacha`. `Weapons` can be obtained through `quests`.

| Rarity     | Drop Rate | Pity |
| ---------- | --------- | ---- |
| ⭐⭐⭐⭐⭐ | 0.006     | 73   |
| ⭐⭐⭐⭐   | 0.051     | 8    |

> Note: ⭐⭐⭐ will always drop rarity 3 weapons

**For Single Pull**

- **Endpoint** : `GET > game/gacha`
- **Response** :

  ```json
  {
    "name": "character name",
    "vision": "character vision",
    "rarity": "character rarity in ⭐"
    "remaining_primogems": "💎<amount>"
  }
  ```

**For 10 Pulls**

- **Endpoint** : `GET > game/gacha_multi`

### Inventory

- **Endpoint** : `GET > game/inventory`
- **Response** :

  ```json
  {
    "characters": [
                    {
                      "name": "character_name",
  		            "vision": "character_vision",
  		            "rarity": "character rarity in ⭐",
  		          },
                    {"..."}
                  ],
    "weapons":  [
                  {
                    "name": "weapon_name",
  		          "vision": "character_vision",
  		          "rarity": "character rarity in ⭐",
  		        },
                  {"..."}
                ]
  }
  ```

  **For Character Only**

- **Endpoint** : `GET > game/inventory/characters`
- **Endpoint** : `GET > game/inventory/characters/{:uchar_id}`

  **For Weapon Only**

- **Endpoint** : `GET > game/inventory/weapons`
- **Endpoint** : `GET > game/inventory/weapons/{:uweap_id}`

### Upgrade

- **Endpoint** : `GET > game/inventory/characters/upgrade/{:uchar_id}`

  This will upgrade the character `by 1 level` at the cost of `160` primogems. `uchar_id` is the `user_character_id` of the character you want to upgrade. It can be found in `game/inventory/characters`.

- **Endpoint** : `GET > game/inventory/weapons/upgrade/{:uweap_id}`

  This will upgrade the weapon `by 1 level` at the cost of `160` primogems. `uweap_id` is the `user_weapon_id` of the weapon you want to upgrade. It can be found in `game/inventory/weapons`.

### Quest

- **Endpoint** : `GET > game/quests`

  This will return a list of all available quests.

- **Endpoint** : `GET > game/quests/status`

  This will show the user status of the quest. Like `inProgress` and `completed`.

- **Endpoint** : `GET > game/quests/accept/{:quest_id}`

  This will accept a quest. `quest_id` is the `quest_id` of the quest you want to accept. It can be found in `game/quests`. You must accept the quest if you want to keep track of the eliminated enemies.

### Party (Team creation)

- **Endpoint** : `GET > game/party`

  This will return a list of all characters in your party.

- **Endpoint** : `POST > game/party/add/{:uchar_id}`

  This will add a character to your party. `uchar_id` is the `user_character_id` of the character you want to add. It can be found in `game/inventory/characters`.

- **Endpoint** : `POST > game/party/remove/{:uchar_id}`

  This will remove a character from your party. `uchar_id` is the `user_character_id` of the character you want to remove. It can be found in `game/inventory/characters`. The `uchar_id` must be in your party.

- **Endpoint** : `POST > game/party/replace/:uchar_id/:uweap_id`

  This will replace the weapon of a character in your party. `uchar_id` is the `user_character_id` of the character you want to replace. It can be found in `game/inventory/characters`. The `uweap_id` must be in your inventory.

> **Note**: You must have the party in order to join battle.

### Combat System

- **Endpoint** : `GET > game/combat/list`

  List all the enemies in the combat system.

- **Endpoint** : `GET > game/combat/select/{:idx}`

  Select an enemy from the combat system. `idx` is the index of the enemy you want to select. It can be found in `game/combat/list`.

- **Endpoint** : `GET > game/combat/attack/{:partyIdx}`

  You must select an enemy first. Attack an enemy from the combat system. `partyIdx` is the index of the party member in your party. It can be found in `game/party`.

## References
