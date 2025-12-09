import React, { useRef, useEffect, useState } from 'react';
import { BoardCell, Position } from '../../../../../shared/contracts/types';
import './Board.css';

interface BoardProps {
  board: BoardCell[][];
  boardSize: number;
  lastMove: Position | null;
  onStonePlace: (position: Position) => void;
  disabled?: boolean;
}

/**
 * Board Component - Canvas-based Go board rendering
 * 棋盤元件 - 使用 Canvas 渲染圍棋棋盤
 */
export const Board: React.FC<BoardProps> = ({
  board,
  boardSize,
  lastMove,
  onStonePlace,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  // Constants for rendering
  const cellSize = 30;
  const margin = 30; // Margin for coordinates
  const padding = 20; // Padding inside the board grid
  const canvasSize = boardSize * cellSize + margin * 2;

  useEffect(() => {
    drawBoard();
  }, [board, lastMove, hoverPos, boardSize]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas (transparent because background is handled by CSS)
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw coordinates
    drawCoordinates(ctx);

    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < boardSize; i++) {
      const pos = margin + i * cellSize + cellSize / 2;

      // Horizontal lines
      ctx.moveTo(margin + cellSize / 2, pos);
      ctx.lineTo(canvasSize - margin - cellSize / 2, pos);

      // Vertical lines
      ctx.moveTo(pos, margin + cellSize / 2);
      ctx.lineTo(pos, canvasSize - margin - cellSize / 2);
    }
    ctx.stroke();

    // Draw star points
    const starPoints = getStarPoints(boardSize);
    starPoints.forEach(point => {
      const x = margin + point.x * cellSize + cellSize / 2;
      const y = margin + point.y * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
    });

    // Draw stones
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const cell = board[y][x];
        if (cell !== 0) {
          drawStone(ctx, x, y, cell === 1 ? 'black' : 'white', false);
        }
      }
    }

    // Draw last move marker
    if (lastMove) {
      drawLastMoveMarker(ctx, lastMove.x, lastMove.y);
    }

    // Draw hover preview
    if (hoverPos && !disabled && board[hoverPos.y][hoverPos.x] === 0) {
      drawStone(ctx, hoverPos.x, hoverPos.y, 'black', true);
    }
  };

  const drawCoordinates = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const letters = 'ABCDEFGHJKLMNOPQRST'.split('');

    for (let i = 0; i < boardSize; i++) {
      const pos = margin + i * cellSize + cellSize / 2;

      // Top letters
      ctx.fillText(letters[i], pos, margin / 2);
      // Bottom letters
      ctx.fillText(letters[i], pos, canvasSize - margin / 2);

      // Left numbers
      ctx.fillText((boardSize - i).toString(), margin / 2, pos);
      // Right numbers
      ctx.fillText((boardSize - i).toString(), canvasSize - margin / 2, pos);
    }
  };

  const drawStone = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: 'black' | 'white',
    isPreview: boolean
  ) => {
    const posX = margin + x * cellSize + cellSize / 2;
    const posY = margin + y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 1.5;

    ctx.save();

    if (isPreview) {
      ctx.globalAlpha = 0.5;
    } else {
      // Shadow for placed stones
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    ctx.beginPath();
    ctx.arc(posX, posY, radius, 0, 2 * Math.PI);

    // Gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      posX - radius / 3,
      posY - radius / 3,
      radius / 10,
      posX,
      posY,
      radius
    );

    if (color === 'black') {
      gradient.addColorStop(0, '#444');
      gradient.addColorStop(1, '#000');
    } else {
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(1, '#ddd');
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    // Restore context to remove shadow for other elements
    ctx.restore();
  };

  const drawLastMoveMarker = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const posX = margin + x * cellSize + cellSize / 2;
    const posY = margin + y * cellSize + cellSize / 2;

    ctx.beginPath();
    ctx.arc(posX, posY, 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ef4444'; // Red marker
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const getStarPoints = (size: number): Position[] => {
    if (size === 19) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
        { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
        { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }
      ];
    } else if (size === 13) {
      return [
        { x: 3, y: 3 }, { x: 9, y: 3 },
        { x: 6, y: 6 },
        { x: 3, y: 9 }, { x: 9, y: 9 }
      ];
    } else {
      return [{ x: 4, y: 4 }];
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const x = Math.round((clickX - margin - cellSize / 2) / cellSize);
    const y = Math.round((clickY - margin - cellSize / 2) / cellSize);

    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
      onStonePlace({ x, y });
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = Math.round((mouseX - margin - cellSize / 2) / cellSize);
    const y = Math.round((mouseY - margin - cellSize / 2) / cellSize);

    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
      setHoverPos({ x, y });
    } else {
      setHoverPos(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div className="board-container">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        className={`board-canvas ${disabled ? 'disabled' : ''}`}
      />
    </div>
  );
};
