Wallet API – Backend Assignment Submission
Overview

This backend implements a Wallet API using NestJS.
The original codebase had logical gaps in error handling, validation, and response consistency. These issues have been identified and corrected to ensure the API behaves reliably and follows REST best practices.

Problems Identified

Wallet existence was not properly validated in all methods.

Some operations could cause runtime crashes if the wallet did not exist.

Negative or zero transaction amounts were allowed.

Error handling was inconsistent across different methods.

There was no structured handling for unexpected runtime errors.

Improvements Implemented
1. Proper Validation

Wallet existence is validated before performing any operation.

Credit and debit operations reject zero or negative amounts.

Debit operation ensures sufficient balance before deduction.

2. Structured Error Handling

All service methods are wrapped in try-catch blocks.

Known exceptions (BadRequestException, NotFoundException) are preserved.

Unexpected errors are converted into InternalServerErrorException.

The API does not crash due to unhandled runtime errors.

3. Consistent API Response

All endpoints now return a consistent response structure:
{ "balance": number }

This ensures predictable behavior for frontend integration.

API Endpoints
GET /wallet/balance

Query Parameter:

userId

Description: Returns the current wallet balance.

POST /wallet/credit

Request Body:

userId

amount

Description: Adds the specified amount to the wallet balance after validation.

POST /wallet/debit

Request Body:

userId

amount

Description: Deducts the specified amount from the wallet balance after validating:

Wallet exists

Amount is valid

Sufficient balance is available

Error Handling Behavior

The API returns appropriate HTTP status codes:

404 Not Found – When wallet does not exist

400 Bad Request – For invalid amounts or insufficient balance

500 Internal Server Error – For unexpected runtime failures

Future Enhancements

Replace in-memory storage with MongoDB

Add DTO validation using class-validator

Add unit and integration tests

Implement transaction logging

Add concurrency control for production readiness
