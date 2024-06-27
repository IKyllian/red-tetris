import { describe, it, expect } from 'vitest';
import React from 'react';
import { CellType } from 'front/types/tetrominoes.type'
import { render } from '@testing-library/react';
import PiecePreview from 'front/components/board/piece-preview'

describe('piece preview', () => {
    it('should display the preview of a piece', async () => {
        const size = 4
        const tetromino = {
            type: CellType.I,
            position: { x: 3, y: -1 },
            rotationState: 0,
        }
        const piecePreviewSize = {
            width: 100,
            height: 100,
        }
        const { findAllByTestId, findByTestId } = render(<PiecePreview tetromino={tetromino} piecePreviewSize={piecePreviewSize} />)

        const cells = await findAllByTestId("cell-preview")
        const board = await findByTestId("board")

        expect(cells).toHaveLength(size * size)
        expect(board).toHaveStyle({
            gridTemplateRows: `repeat(4, 1fr)`,
            gridTemplateColumns: `repeat(4, 1fr)`,
            height: `${piecePreviewSize.height}px`,
            width: `${piecePreviewSize.width}px`,
        })
    })
})