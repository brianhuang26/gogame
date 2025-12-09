import { 
  BoardSize, 
  GameRules, 
  GameStatus, 
  GameState, 
  Move, 
  PlayerInGame, 
  TimerConfig, 
  GameResult,
  CheatFlag
} from '../../../shared/contracts/types';

/**
 * Game Model Interface
 * 對局模型介面
 */
export interface Game {
  _id?: string;
  gameId: string;
  boardSize: BoardSize;
  rules: GameRules;
  komi: number;
  players: {
    black: PlayerInGame;
    white: PlayerInGame;
  };
  state: GameState;
  moves: Move[];
  timer?: TimerConfig;
  status: GameStatus;
  result?: GameResult;
  flags?: CheatFlag[];
  createdAt: Date;
  updatedAt: Date;
}
