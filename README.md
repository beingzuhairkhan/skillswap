

# Wallet API – Backend Assignment Submission

## Overview

This backend implements a Wallet API using NestJS.
The original implementation had issues with error handling, validation, and response consistency.
These issues have been fixed to ensure the API behaves reliably and follows REST best practices.

---

## Problems Identified

* Wallet existence was not properly validated in all methods.
* Some operations could cause runtime crashes if the wallet did not exist.
* Negative or zero transaction amounts were allowed.
* Error handling was inconsistent across different methods.
* API responses were not consistent in structure.

---

## Improvements Implemented

* Wallet existence is validated before performing any operation.
* Credit and debit operations reject zero or negative amounts.
* Debit operation ensures sufficient balance before deduction.
* All service methods use structured error handling with try-catch blocks.
* All endpoints return a consistent response structure: `{ "balance": number }`.

---

## API Endpoints

### GET /wallet/balance?userId=u1

**Response:**

```
{
  "balance": 100
}
```

---

### POST /wallet/credit

**Request Body:**

```
{
  "userId": "u1",
  "amount": 50
}
```

**Response:**

```
{
  "balance": 150
}
```

---

### POST /wallet/debit

**Request Body:**

```
{
  "userId": "u1",
  "amount": 30
}
```

**Response:**

```
{
  "balance": 120
}
```

---

## Error Responses

**Wallet Not Found:**

```
{
  "statusCode": 404,
  "message": "Wallet not found",
  "error": "Not Found"
}
```

**Insufficient Balance:**

```
{
  "statusCode": 400,
  "message": "Insufficient balance",
  "error": "Bad Request"
}
```

**Invalid Amount:**

```
{
  "statusCode": 400,
  "message": "Amount must be greater than zero",
  "error": "Bad Request"
}
```


---

