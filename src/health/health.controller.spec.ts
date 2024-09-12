import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let httpHealthIndicator: HttpHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check: jest.fn() } },
        { provide: HttpHealthIndicator, useValue: { pingCheck: jest.fn() } },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    httpHealthIndicator = module.get<HttpHealthIndicator>(HttpHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should perform a health check', async () => {
    const mockPingResult = { nestjsDocks: { status: 'up' } };
    httpHealthIndicator.pingCheck = jest.fn().mockResolvedValue(mockPingResult);

    const mockHealthResult = { status: 'ok', info: mockPingResult };
    (healthCheckService.check as jest.Mock).mockResolvedValue(mockHealthResult);

    const result = await controller.check();

    expect(healthCheckService.check).toHaveBeenCalledWith([
      expect.any(Function),
    ]);
    expect(result).toEqual(mockHealthResult);
  });
});
