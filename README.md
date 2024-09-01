# Suvidha

## _A convenience library for Expressjs_

It's little difficult to explain, it's a middleware? sort of, which adds a validation layer with type inference, not just that it can also send the response
instead of doing `res.status(...).json(...)` everytime. **Suvidha** is a convenience, Written in Typescript.

## Features

-   Add validation layer for incoming requests with ease
-   Type safety, request object will be typed in accordance with valiation configuration
-   Ease of sending response, no need to do `res.status(...).json(...)` everytime.
-   Provides HTTP status code classes for sending responses

## What this solves?

We add validation layer for incoming requests say using a middleware in **Express**. It's all good and nice, but types are not synced.
What I mean is if you change schema there is no way request handler will know nor does your compiler that request body(say) has changed.

<video  controls>
  <source src="./demo.mp4" type="video/mp4">
</video>

## Usage

Suvidha provides default handlers to handle beginning and ending of request-response cycle. which loosely follows [jsend](https://github.com/omniti-labs/jsend) spec.

There are 4 handlers

-   `controllerResponseHandler`
-   `controllerErrorHandler`
-   `validationErrorHandler`
-   `unexpectedErrorHandler`
