import { waitFor } from '@testing-library/dom';
import { Mock, describe, expect, it, vi } from 'vitest';
import { createFetchResponse, createFetchThrow404Error } from '../fetch-utils';
import { getLobbyList } from 'front/api/lobby.api';
import { ILobby } from 'front/types/lobby.type';

describe("api/lobby", () => {
    const lobby: ILobby[] = [
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
        (fetch as Mock).mockResolvedValue(createFetchResponse(lobby))
        const lobbyData = await getLobbyList()
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:3000/lobby", { method: "GET" }));
        expect(lobbyData).toStrictEqual(lobby)
    })
    it('Should throw http error', async () => {
        (fetch as Mock).mockResolvedValue(createFetchThrow404Error())

        await expect(getLobbyList()).rejects.toThrow("HTTP error! Status: 404");
        expect(fetch).toHaveBeenCalledWith("http://localhost:3000/lobby", { method: "GET" });
    })
})