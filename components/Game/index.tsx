'use client';

import { useEffect, useRef } from 'react';
import { Application, Renderer } from 'pixi.js';
import styles from './Game.module.css';
import { createGameUpdate } from '@/game/gameLoop';
import constants from '@/game/constants';

const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const app = new Application({
      width: constants.gameWidth,
      height: constants.gameHeight,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    const canvas = app.view as HTMLCanvasElement;
    gameRef.current.appendChild(canvas);

    // Proper scaling setup
    const resize = () => {
      const parent = gameRef.current;
      if (!parent || !canvas) return;

      const scaleFactor = Math.min(
        parent.clientWidth / constants.gameWidth,
        parent.clientHeight / constants.gameHeight
      );

      canvas.style.width = `${constants.gameWidth * scaleFactor}px`;
      canvas.style.height = `${constants.gameHeight * scaleFactor}px`;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize game
    const gameUpdate = createGameUpdate(app.stage, app.renderer as Renderer);
    app.ticker.add(gameUpdate);

    return () => {
      window.removeEventListener('resize', resize);
      app.destroy(true);
    };
  }, []);

  return <div ref={gameRef} className={styles.gameWrapper} />;
};

export default Game;