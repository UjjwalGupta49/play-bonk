import { Sprite, Text, Texture, Container } from 'pixi.js'
import { cardLabelTextStyle } from '@/styles/textStyles';

class ScoreCard extends Container {
    private backdrop: Sprite;
    private scoreLabel: Text;
    private highScoreLabel: Text;
    public score: Text;
    public highScore: Text;
    
    constructor() {
        super();
        
        // Create a darker backdrop with arcade-style border
        this.backdrop = new Sprite(Texture.WHITE);
        this.backdrop.tint = 0x171B26; // Matching the dark background from index.tsx
        this.backdrop.alpha = 0.95;
        this.backdrop.width = 300;
        this.backdrop.height = 250;

        // Create yellow border (similar to the ffe135 color used in index.tsx)
        const border = new Sprite(Texture.WHITE);
        border.tint = 0xffe135;
        border.width = this.backdrop.width + 8; // 4px border on each side
        border.height = this.backdrop.height + 8;
        border.position.set(-4, -4);

        // Update text styles to match arcade theme
        this.scoreLabel = new Text("SCORE", {
            ...cardLabelTextStyle,
            fontSize: 48,
            fontFamily: 'VT323, monospace',
            fill: ['#ffe135'], // Yellow color from index.tsx
            stroke: '#000000',
            strokeThickness: 6,
        });

        this.highScoreLabel = new Text("HIGH SCORE", {
            ...cardLabelTextStyle,
            fontSize: 48,
            fontFamily: 'VT323, monospace',
            fill: ['#ffe135'],
            stroke: '#000000',
            strokeThickness: 6,
        });

        this.score = new Text("0", {
            ...cardLabelTextStyle,
            fontSize: 64,
            fontFamily: 'VT323, monospace',
            fill: ['#FFFCEA'], // Light text color from index.tsx
            stroke: '#000000',
            strokeThickness: 6,
        });

        this.highScore = new Text("0", {
            ...cardLabelTextStyle,
            fontSize: 64,
            fontFamily: 'VT323, monospace',
            fill: ['#FFFCEA'],
            stroke: '#000000',
            strokeThickness: 6,
        });

        // Center align all text
        this.score.anchor.set(.5);
        this.scoreLabel.anchor.set(.5);
        this.highScoreLabel.anchor.set(.5);
        this.highScore.anchor.set(.5);

        // Position text elements with more spacing
        this.scoreLabel.y = this.backdrop.height * 0.15;
        this.score.y = this.backdrop.height * 0.35;
        this.highScoreLabel.y = this.backdrop.height * 0.6;
        this.highScore.y = this.backdrop.height * 0.8;

        // Center horizontally
        this.score.x = this.backdrop.width/2.0;
        this.scoreLabel.x = this.backdrop.width/2.0;
        this.highScore.x = this.backdrop.width/2.0;
        this.highScoreLabel.x = this.backdrop.width/2.0;

        // Add shadow effect to the card
        const shadow = new Sprite(Texture.WHITE);
        shadow.tint = 0x000000;
        shadow.alpha = 0.5;
        shadow.width = this.backdrop.width;
        shadow.height = this.backdrop.height;
        shadow.position.set(4, 4);

        // Layer elements in correct order
        this.addChild(shadow);
        this.addChild(border);
        this.addChild(this.backdrop);
        this.addChild(this.scoreLabel);
        this.addChild(this.score);
        this.addChild(this.highScoreLabel);
        this.addChild(this.highScore);
    }
}

export default ScoreCard;