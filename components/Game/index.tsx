'use client';

import { useEffect, useRef } from 'react';
import { Application, Renderer } from 'pixi.js';
import { createGameUpdate } from '@/game/gameLoop';
import constants from '@/game/constants';
import { useGameToast } from '@/hooks/useGameToast';

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { showPositionRequiredToast } = useGameToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new Application({
      view: canvasRef.current,
      width: constants.gameWidth,
      height: constants.gameHeight,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    // Initialize game with toast callback
    const gameUpdate = createGameUpdate(
      app.stage, 
      app.renderer as Renderer,
      showPositionRequiredToast
    );
    app.ticker.add(gameUpdate);

    // Proper scaling setup
    const resize = () => {
      if (!canvasRef.current) return;

      const parent = canvasRef.current.parentElement;
      if (!parent) return;

      const scaleFactor = Math.min(
        parent.clientWidth / constants.gameWidth,
        parent.clientHeight / constants.gameHeight
      );

      canvasRef.current.style.width = `${constants.gameWidth * scaleFactor}px`;
      canvasRef.current.style.height = `${constants.gameHeight * scaleFactor}px`;
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      app.destroy(true);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  );
};

export default Game;
