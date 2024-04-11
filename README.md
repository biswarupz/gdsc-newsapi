API: https://news-api.undate-server.workers.dev

News API Backend Documentation

Introduction

The News API Backend provides functionality for users to access and manage news articles. It includes endpoints for user authentication, news retrieval, and premium subscription management.

System Architecture

The backend system architecture follows a modular design, utilizing TypeScript for server-side logic and Prisma as the ORM for interacting with the database. It consists of the following components:

Hono Framework: Used for handling HTTP requests and routing.
Prisma Client: Provides a type-safe interface for database operations and schema management.
PostgreSQL Database: Stores user data, news articles, and authentication tokens.
Endpoints

Authentication
POST /api/news/v1/auth/signup
Description: Allows users to register with the system.
Request Body:
typescript
Copy code
{
fullname: string;
email: string;
password: string;
}
Response:
typescript
Copy code
{
status: number;
token?: string;
message: string;
api?: string;
}
POST /api/news/v1/auth/login
Description: Allows users to authenticate and obtain an access token.
Request Body:
typescript
Copy code
{
email: string;
password: string;
}
Response:
typescript
Copy code
{
status: number;
token?: string;
message: string;
api?: string;
}
POST /api/news/v1/auth/payment
Description: Handles premium subscription payments.
Request Body:
typescript
Copy code
{
token: string;
payment: string; // 'success' or 'failed'
}
Response:
typescript
Copy code
{
status: number;
message: string;
}
News Retrieval
GET /api/news/v1/news
Description: Retrieves news articles based on user preferences.
Query Parameters:
api: User API key (required)
count: Number of news articles to retrieve (optional, for premium users)
category: News category filter (optional)
keyword: Keyword search for news title (optional)
Response:
typescript
Copy code
{
status: number;
message: string;
data: NewsArticle[];
}
Example NewsArticle object:
typescript
Copy code
{
id: string;
title: string;
description: string;
category: string;
}
Error Handling

The backend API follows RESTful principles and returns appropriate HTTP status codes along with descriptive error messages in JSON format.
