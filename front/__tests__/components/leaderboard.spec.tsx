import { describe, expect, afterEach, test, it, vi, Mock } from "vitest";
import { render, cleanup, screen, waitFor, findByTestId } from '@testing-library/react';
import Leaderboard from 'front/components/leaderboard/leaderboard';
import React from "react";
import { getLeaderboard } from "front/api/leaderboard.api";
import { IPlayerScore } from 'front/types/leaderboard.type';
import { createFetchResponse } from "../fetch-utils";

describe("Leaderboard", () => {
    const leaderboard: IPlayerScore[] = [
        {
            playerName: 'Test',
            score: 1542
        },
        {
            playerName: 'Test2',
            score: 15542
        }
    ]
    global.fetch = vi.fn() as Mock
    
    it('Should render Leaderboard component with 2 players', async () => {
        (fetch as Mock).mockResolvedValue(createFetchResponse<IPlayerScore[]>(leaderboard))
        const leaderboardData = await getLeaderboard()
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/leaderboard", { method: "GET" }));
        expect(leaderboardData).toStrictEqual(leaderboard)

        const { findAllByTestId } = render(
            <Leaderboard />
        )

        const playerItems = await findAllByTestId('player-list-item');
        expect(playerItems).toHaveLength(2);

        if (playerItems[0]) {
            expect(playerItems[0]).toHaveTextContent('👑');
            expect(playerItems[0]).toHaveTextContent('Test');
            expect(playerItems[0]).toHaveTextContent('1542');
        }
        if (playerItems[1]) {
            expect(playerItems[1]).toHaveTextContent('#2');
            expect(playerItems[1]).toHaveTextContent('Test2');
            expect(playerItems[1]).toHaveTextContent('15542');
        }
    })
    it('Should render text because no players', async () => {
        (fetch as Mock).mockResolvedValue(createFetchResponse<IPlayerScore[]>([]))
        const leaderboardData = await getLeaderboard()
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/leaderboard", { method: "GET" }));
        expect(leaderboardData).toStrictEqual([])

        const { findAllByTestId } = render(
            <Leaderboard />
        )

        const noPlayerItem = await findAllByTestId('no-player-item');
        expect(noPlayerItem).toHaveLength(1);
        if (noPlayerItem[0]) {
            expect(noPlayerItem[0]).toHaveTextContent('No players yet');
        }
    })
})