import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { Request, Response, NextFunction } from 'express';

describe('LoggerMiddleware', () => {
  let loggerMiddleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerMiddleware = new LoggerMiddleware();
    mockRequest = {
      method: 'GET',
      originalUrl: '/test-url',
    };
    mockResponse = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
        return mockResponse as Response;
      }),
    };
    mockNextFunction = jest.fn();
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(new LoggerMiddleware()).toBeDefined();
  });

  it('should log the HTTP request details on response finish', () => {
    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      mockNextFunction,
    );

    expect(loggerLogSpy).toHaveBeenCalledWith(
      `Logging HTTP request ${mockRequest.method} ${mockRequest.originalUrl} ${mockResponse.statusCode}`,
    );
    expect(mockNextFunction).toHaveBeenCalled();
  });
});
