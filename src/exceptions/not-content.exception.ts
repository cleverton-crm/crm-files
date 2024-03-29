import { HttpException, HttpStatus } from '@nestjs/common';

export class NotContentException extends HttpException {
  /**
   * Instantiate a `NotContentException` Exception.
   *
   * @example
   * `throw new NotContentException()`
   *
   * @usageNotes
   * The HTTP response status code will be 204.
   * - The `objectOrError` argument defines the JSON response body or the message string.
   * - The `description` argument contains a short description of the HTTP error.
   *
   * By default, the JSON response body contains two properties:
   * - `statusCode`: this will be the value 404.
   * - `message`: the string `'Not Content'` by default; override this by supplying
   * a string in the `objectOrError` parameter.
   *
   * If the parameter `objectOrError` is a string, the response body will contain an
   * additional property, `error`, with a short description of the HTTP error. To override the
   * entire JSON response body, pass an object instead. Nest will serialize the object
   * and return it as the JSON response body.
   *
   * @param objectOrError string or object describing the error condition.
   * @param description a short description of the HTTP error.
   */
  constructor(objectOrError, description = 'Not Content') {
    super(HttpException.createBody(objectOrError, description, HttpStatus.NO_CONTENT), HttpStatus.NO_CONTENT);
  }
}
