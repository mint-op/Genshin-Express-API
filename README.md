# Geshin Impact Express

This is Section B `Fantasy Adventures` Theme game.

- [Geshin Impact Express](#geshin-impact-express)
  - [Setup](#setup)
  - [Database Initialization \& Add Data](#database-initialization--add-data)
  - [Endpoints](#endpoints)
    - [Login / Signup](#login--signup)
    - [Gacha](#gacha)

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
   cd .\scripts\
   node .\addData.js
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
    "level": "<Player_level>",
    "primogems": "💎<amount>"
  }
  ```

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
    name: "character name",
    vision: "character vision",
    rarity: "character rarity in ⭐"
    remaining_primogems: "💎<amount>"
  }
  ```

**For 10 Pulls**

- **Endpoint** : `GET > game/gacha_multi`
