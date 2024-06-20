import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('leaderboard')
export class Leaderboard {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	playerName: string;

	@Column()
	score: number;
}
