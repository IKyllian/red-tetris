import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Commands } from '../../type/command.types';
import { Optional } from '@nestjs/common';

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
	@IsBoolean()
	createLobbyIfNotExists: boolean;
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
