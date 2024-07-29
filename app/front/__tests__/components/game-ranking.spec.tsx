import { describe, it, expect } from "vitest";
import { IPlayer } from 'front/types/player.type';
import { render } from "@testing-library/react";
import GameRanking from 'front/components/game-ranking/game-ranking';
import React from 'react';

describe('Game Ranking', () => {
    const leaderboard: IPlayer[] = [
        {
            name: 'Test',
            id: 'qqwd',
            isLeader: true
        },
        {
            name: 'Test2',
            id: 'asqwe',
            isLeader: false
        },
        {
            name: 'Test3',
            id: 'afewq',
            isLeader: false
        }
    ]
    it('Should render Game Ranking component', async () => {
        const { findAllByTestId } = render(<GameRanking leaderboard={leaderboard} />)

        const rankItems = await findAllByTestId("rank-item")
        expect(rankItems).toHaveLength(3)

        if (rankItems[0]) {
            expect(rankItems[0]).toHaveTextContent(leaderboard[0].name)
        }
        if (rankItems[1]) {
            expect(rankItems[1]).toHaveTextContent('#2')
            expect(rankItems[1]).toHaveTextContent(leaderboard[1].name)
        }
        if (rankItems[2]) {
            expect(rankItems[2]).toHaveTextContent('#3')
            expect(rankItems[2]).toHaveTextContent(leaderboard[2].name)
        }
    })
})