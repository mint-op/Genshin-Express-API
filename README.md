# API Documentation

## Table of Contents

- [API Documentation](#api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Geting Started](#geting-started)
  - [Endpoints for Section A](#endpoints-for-section-a)
    - [1. Get Task Details](#1-get-task-details)
    - [2. Update Task](#2-update-task)
    - [3. Delete Task](#3-delete-task)
    - [4. Create Task Progress](#4-create-task-progress)
    - [5. Get Progress Details](#5-get-progress-details)
    - [6. Update Progress](#6-update-progress)
    - [7. Delete Progress](#7-delete-progress)
  - [Endpoints for Section B](#endpoints-for-section-b)

## Geting Started

First install the required modules

```
npm install express
npm install mysql2
npm install dotenv
npm install nodemon
```

then create `.env` file in the root dir with the following content

```
DB_HOST="your host"
DB_USER="your database username"
DB_PASSWORD="your database password"
DB_DATABASE="your database name"
```

## Endpoints for Section A

### 1. Get Task Details

<details>
    
   - **Endpoint**: `GET /tasks/{task_id}`
   - **Response:**
```
{
    "task_id": 1,
    "title": "Plant a Tree",
    "description": "Plant a tree...",
    "points": 50
}
```
  - **Status Code**: 200 OK
  - **Error Handling**: 404 Not Found if `task_id` doesn't exist.
</details>

### 2. Update Task

<details>
    
   - **Endpoint**: `PUT /tasks/{task_id}`
   - **Request Body:**
```
{
    "title": "Plant Two Trees", 
    "description": "Plant two trees...", 
    "points": 60
}
```
  - **Response**:
```
{
    "task_id": 1, 
    "title": "Plant Two Trees", 
    "description": "Plant two trees...", 
    "points": 60
}
```
  - **Status Code**: 200 OK
  - **Error Handling**: 404 Not Found if `task_id` doesn't exist. 400 Bad Request if body is incomplete.
</details>

### 3. Delete Task

<details>

- **Endpoint**: `DELETE /tasks/{task_id}`
- **Status Code**: 204 No Content
- **Error Handling**: 404 Not Found if `task_id` doesn't exist.
</details>

### 4. Create Task Progress

<details>
    
   - **Endpoint**: `POST /task_progress`
   - **Request Body:**
```
{
    "user_id": 1, 
    "task_id": 1, 
    "completion_date": "2023-07-30", 
    "notes": "Planted a tree."
}
```
  - **Response**:
```
{
    "progress_id": 1, 
    "user_id": 1, 
    "task_id": 1, 
    "completion_date": "2023-07-30", 
    "notes": "Planted a tree."
}
```
  - **Status Code**: 201 Created
  - **Error Handling**: 404 Not Found if `user_id` or `task_id` doesn't exist. 400 Bad Request if completion_date is missing.
</details>

### 5. Get Progress Details

<details>
    
   - **Endpoint**: `GET /task_progress/{progress_id}`
   - **Response:**
```
{
    "progress_id": 1, 
    "user_id": 1, 
    "task_id": 1, 
    "completion_date": "2023-07-30", 
    "notes": "Planted a tree."
}
```
  - **Status Code**: 200 OK
  - **Error Handling**: 404 Not Found if `progress_id` doesn't exist.
</details>

### 6. Update Progress

<details>
    
   - **Endpoint**: `PUT /task_progress/{progress_id}`
   - **Request Body:**
```
{
    "notes": "Planted two trees this time!"
}
```
  - **Response**:
```
{
    "progress_id": 1, 
    "user_id": 1, 
    "task_id": 1, 
    "completion_date": "2023-07-30", 
    "notes": "Planted two trees!"
}
```
  - **Status Code**: 200 OK
  - **Error Handling**: 404 Not Found if `progress_id` doesn't exist. 400 Bad Request if `notes` is missing.
</details>

### 7. Delete Progress

<details>

- **Endpoint**: `DELETE /task_progress/{progress_id}`
- **Status Code**: 204 No Content
- **Error Handling**: 404 Not Found if `progress_id` doesn't exist.
</details>

## Endpoints for Section B
