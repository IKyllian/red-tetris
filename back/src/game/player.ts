export class Player {
	public name: string;
	public id: string;
	public isLeader: boolean;

	constructor(name: string, id: string, isLeader: boolean = false) {
		this.name = name;
		this.id = id;
		this.isLeader = isLeader;
	}
}
