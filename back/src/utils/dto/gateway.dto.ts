import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Commands } from '../../type/command.types';

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
	@IsEnum(Commands, { each: true })
	inputs: Commands[];
}

export class TickAdjustmentPacketDto {
	@IsNumber()
	tick: number;
	@IsNumber()
	adjustmentIteration: number;
}
