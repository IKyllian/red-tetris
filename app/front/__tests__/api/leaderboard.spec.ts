import { waitFor } from '@testing-library/dom';
import { IPlayerScore } from 'front/types/leaderboard.type';
import { Mock, describe, expect, it, vi } from 'vitest';
import { createFetchResponse, createFetchThrow404Error } from '../fetch-utils';
import { getLeaderboard } from 'front/api/leaderboard.api';

describe("api/leaderboard", () => {
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
    
    it('Should return fetch result', async () => {
        (fetch as Mock).mockResolvedValue(createFetchResponse(leaderboard))
        const leaderboardData = await getLeaderboard()
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/leaderboard", { method: "GET" }));
        expect(leaderboardData).toStrictEqual(leaderboard)
    })
    it('Should throw http error', async () => {
        (fetch as Mock).mockResolvedValue(createFetchThrow404Error())

        await expect(getLeaderboard()).rejects.toThrow("HTTP error! Status: 404");
        expect(fetch).toHaveBeenCalledWith("http://localhost:3000/leaderboard", { method: "GET" });
    })
})