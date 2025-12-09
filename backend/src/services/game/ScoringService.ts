import { BoardCell, Position, StoneColor } from '../../../../shared/contracts/types';

interface ScoreResult {
    black: number;
    white: number;
    blackTerritory: number;
    whiteTerritory: number;
    blackCaptured: number;
    whiteCaptured: number;
}

export class ScoringService {
    /**
     * Calculate the score of the game using simplified territory counting.
     * Note: This is a basic implementation and may not handle complex seki or dead stones correctly without user input.
     * It assumes all stones on the board are alive.
     */
    public static calculateScore(
        board: BoardCell[][],
        capturedStones: { black: number; white: number },
        komi: number = 6.5
    ): ScoreResult {
        const size = board.length;
        const visited = new Set<string>();
        let blackTerritory = 0;
        let whiteTerritory = 0;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const posKey = `${x},${y}`;
                if (board[y][x] === 0 && !visited.has(posKey)) {
                    // Found an empty intersection, start BFS/DFS to find the territory owner
                    const region = this.getRegion(board, { x, y }, visited);

                    if (region.owner === 'black') {
                        blackTerritory += region.points.length;
                    } else if (region.owner === 'white') {
                        whiteTerritory += region.points.length;
                    }
                    // If owner is 'neutral' (touches both colors), it's dame (no points)
                }
            }
        }

        // Total score = Territory + Captured Stones + Komi (for white)
        // Note: Chinese rules count stones on board too, but here we use Japanese-like territory counting for simplicity as per common online implementations,
        // OR we can stick to Chinese rules if specified. The prompt didn't strictly specify, but "Territory counting" usually implies Japanese.
        // However, MVP-IMPLEMENTATION.md mentions "ScoringService (Territory counting)".
        // Let's implement Territory + Captured.

        return {
            black: blackTerritory + capturedStones.black,
            white: whiteTerritory + capturedStones.white + komi,
            blackTerritory,
            whiteTerritory,
            blackCaptured: capturedStones.black,
            whiteCaptured: capturedStones.white
        };
    }

    private static getRegion(
        board: BoardCell[][],
        start: Position,
        visited: Set<string>
    ): { points: Position[]; owner: StoneColor | 'neutral' } {
        const size = board.length;
        const points: Position[] = [];
        const queue: Position[] = [start];
        const touchedColors = new Set<StoneColor>();

        visited.add(`${start.x},${start.y}`);
        points.push(start);

        let head = 0;
        while (head < queue.length) {
            const { x, y } = queue[head++];

            const neighbors = [
                { x: x + 1, y },
                { x: x - 1, y },
                { x, y: y + 1 },
                { x, y: y - 1 }
            ];

            for (const neighbor of neighbors) {
                if (neighbor.x >= 0 && neighbor.x < size && neighbor.y >= 0 && neighbor.y < size) {
                    const cell = board[neighbor.y][neighbor.x];
                    const key = `${neighbor.x},${neighbor.y}`;

                    if (cell === 0) {
                        if (!visited.has(key)) {
                            visited.add(key);
                            points.push(neighbor);
                            queue.push(neighbor);
                        }
                    } else {
                        // It's a stone
                        touchedColors.add(cell === 1 ? 'black' : 'white');
                    }
                }
            }
        }

        let owner: StoneColor | 'neutral' = 'neutral';
        if (touchedColors.size === 1) {
            owner = Array.from(touchedColors)[0];
        }

        return { points, owner };
    }
}
