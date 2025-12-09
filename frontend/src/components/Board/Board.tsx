import React, { useRef, useEffect, useState } from 'react';
import { BoardCell, Position } from '../../../../../shared/contracts/types';

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
  const cellSize = 30;
  const margin = 30;
  const canvasSize = boardSize * cellSize + margin * 2;

  useEffect(() => {
    drawBoard();
  }, [board, lastMove, hoverPos]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 繪製背景
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 繪製網格線
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let i = 0; i < boardSize; i++) {
      const pos = margin + i * cellSize;
      
      // 橫線
      ctx.beginPath();
      ctx.moveTo(margin, pos);
      ctx.lineTo(canvasSize - margin, pos);
      ctx.stroke();

      // 豎線
      ctx.beginPath();
      ctx.moveTo(pos, margin);
      ctx.lineTo(pos, canvasSize - margin);
      ctx.stroke();
    }

    // 繪製星位
    const starPoints = getStarPoints(boardSize);
    starPoints.forEach(point => {
      const x = margin + point.x * cellSize;
      const y = margin + point.y * cellSize;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
    });

    // 繪製棋子
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const cell = board[y][x];
        if (cell !== 0) {
          drawStone(ctx, x, y, cell === 1 ? 'black' : 'white', false);
        }
      }
    }

    // 標記最後一手
    if (lastMove) {
      drawLastMoveMarker(ctx, lastMove.x, lastMove.y);
    }

    // 繪製懸停預覽
    if (hoverPos && !disabled) {
      drawStone(ctx, hoverPos.x, hoverPos.y, 'black', true);
    }
  };

  const drawStone = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: 'black' | 'white',
    isPreview: boolean
  ) => {
    const posX = margin + x * cellSize;
    const posY = margin + y * cellSize;
    const radius = cellSize / 2 - 2;

    ctx.beginPath();
    ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
    
    if (isPreview) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = color === 'black' ? '#000' : '#fff';
    ctx.fill();

    if (color === 'white') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.globalAlpha = 1.0;
  };

  const drawLastMoveMarker = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const posX = margin + x * cellSize;
    const posY = margin + y * cellSize;

    ctx.beginPath();
    ctx.arc(posX, posY, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f00';
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

    const x = Math.round((clickX - margin) / cellSize);
    const y = Math.round((clickY - margin) / cellSize);

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

    const x = Math.round((mouseX - margin) / cellSize);
    const y = Math.round((mouseY - margin) / cellSize);

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
    <div style={{ display: 'inline-block', padding: '20px' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};
