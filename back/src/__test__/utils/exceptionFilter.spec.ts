import { BadRequestException, ArgumentsHost } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { WsException, BaseWsExceptionFilter } from '@nestjs/websockets';
import { WsExceptionFilter } from '../../utils/exceptionFilter';

describe('WsExceptionFilter', () => {
	let filter: WsExceptionFilter;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [WsExceptionFilter],
		}).compile();

		filter = module.get<WsExceptionFilter>(WsExceptionFilter);
	});

	it('should catch BadRequestException and call super.catch with a WsException', () => {
		const exception = new BadRequestException('Bad request');
		const host = {
			switchToWs: jest.fn().mockReturnThis(),
			getClient: jest.fn(),
			getData: jest.fn(),
		} as any as ArgumentsHost;

		const properException = new WsException(exception.getResponse());
		const catchSpy = jest
			.spyOn(BaseWsExceptionFilter.prototype, 'catch')
			.mockImplementation(() => {});

		filter.catch(exception, host);

		expect(catchSpy).toHaveBeenCalledWith(properException, host);
	});
});
