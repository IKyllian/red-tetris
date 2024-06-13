import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { COMMANDS } from 'src/type/command.types';

export class CreateLobbyDto {
	@IsString()
	name: string;
	@IsString()
	playerName: string;
}

export class JoinLobbyDto {
	@IsString()
	playerName: string;
	@IsString()
	@IsNotEmpty()
	lobbyId: string;
}

export class StartGameDto {
	@IsString()
	playerName: string;
}

export class InputsPacketDto {
	@IsNumber()
	tick: number;
	@IsNumber()
	adjustmentIteration: number;
	@IsEnum(COMMANDS, { each: true })
	inputs: COMMANDS[];
}

export class TickAdjustmentPacketDto {
	@IsNumber()
	tick: number;
	@IsNumber()
	adjustmentIteration: number;
}
