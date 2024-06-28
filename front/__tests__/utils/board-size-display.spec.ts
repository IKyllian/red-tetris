import { describe, it, expect, vi } from "vitest";
import { getPiecePreviewSize, getBoardStyleSize } from 'front/utils/board-size-display-utils';

describe('board-size-display.utils', () => {
    describe('getBoardStyleSize', () => {
	    const { innerWidth: width, innerHeight: height } = window;
        it('Should return the size of the player board', () => {
            const size = {
                widthRatio: 0.3,
                heightRatio: 0.5,
                width,
                height,
            }
            
            const ret = getBoardStyleSize(false, 0);
            const widthResult = Math.min(
                size.width * size.widthRatio,
                size.height * size.widthRatio
            )
            const heightResult = Math.min(
                size.width * size.heightRatio,
                size.height * size.heightRatio
            )
            expect(ret.width).toBe(widthResult);
            expect(ret.height).toBe(heightResult);
        })
        it('Should return the size of the opponent board when numberOfOpponents is 1', () => {
            const size = {
                widthRatio: 0.3,
                heightRatio: 0.5,
                width,
                height,
            }
            
            const ret = getBoardStyleSize(true, 1);
            const widthResult = Math.min(
                size.width * size.widthRatio,
                size.height * size.widthRatio
            )
            const heightResult = Math.min(
                size.width * size.heightRatio,
                size.height * size.heightRatio
            )
            expect(ret.width).toBe(widthResult);
            expect(ret.height).toBe(heightResult);
        })
        it('Should return the size of the opponent board when numberOfOpponents is > 1', () => {
            const size = {
                widthRatio: 0.1,
                heightRatio: 0.2,
                width: width / 2,
                height: width / 2,
            }
            
            const ret = getBoardStyleSize(true, 5);
            const widthResult = Math.min(
                size.width * size.widthRatio,
                size.height * size.widthRatio
            )
            const heightResult = Math.min(
                size.width * size.heightRatio,
                size.height * size.heightRatio
            )
            expect(ret.width).toBe(widthResult);
            expect(ret.height).toBe(heightResult);
        })
    })

    describe('getPiecePreviewSize', () => {
        it('Should return the size of the piece preview based on the board size', () => {
            const boardSize = {
                width: 100,
                height: 100,
            }
            const ret = getPiecePreviewSize(boardSize);
            expect(ret.width).toBe(boardSize.width * 0.4);
            expect(ret.height).toBe(boardSize.height * 0.2);
        })    
    })
})