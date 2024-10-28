/*
    ABOUT:

    This file handles the parallax background by grouping multiple
    Sprites and providing a utility function to move the entire background.
*/


import { Container, Texture } from 'pixi.js';

// Replace dynamic imports with direct string paths
// const backgroundImg = '/assets/background/layers/tradingView.png' // parallax-mountain-bg.png
// const mountainsImg = '/assets/background/layers/tradingView.png' // parallax-mountain-mountains.png
// const treesImg = '/assets/background/layers/tradingView     .png' // parallax-mountain-trees.png
// const foregroundTreesImg = '/assets/background/layers/tradingView.png' // parallax-mountain-foreground-trees.png
const farMountainImg = '/assets/background/layers/tradingView.png' // parallax-mountain-montain-far.png

// Update relative imports
import HorizontalTilingSprite from './horizontalTiling'
import constants from './constants'

class parallaxBackground extends Container {
    // private background : HorizontalTilingSprite;
    private farMountain : HorizontalTilingSprite;
    // private mountains : HorizontalTilingSprite;
    // private trees : HorizontalTilingSprite;
    // private foregroundTrees : HorizontalTilingSprite;

    constructor() {
        super();

        // Create background
        // const backgroundTexture = Texture.from(backgroundImg as string);
        // this.background = new HorizontalTilingSprite(backgroundTexture, constants['gameWidth'], constants['gameHeight']);
        // this.background.setWidth(constants['gameWidth']);
        // this.background.setHeight(constants['gameHeight']);

        const farMountainTexture = Texture.from(farMountainImg as string);
        this.farMountain = new HorizontalTilingSprite(farMountainTexture);
        this.farMountain.anchor.set(0,1);
        this.farMountain.x = 0;
        this.farMountain.y = constants['gameHeight'];
        this.farMountain.setWidth(constants['gameWidth']);
        this.farMountain.setHeight(constants['gameHeight']); // Changed this line to use full height

        // const mountainsTexture = Texture.from(mountainsImg as string);
        // this.mountains = new HorizontalTilingSprite(mountainsTexture);
        // this.mountains.anchor.set(0,1);
        // this.mountains.x = 0;
        // this.mountains.y = constants['gameHeight'];
        // this.mountains.setWidth(constants['gameWidth']);
        // this.mountains.setHeight(constants['gameHeight']/2);
        

        // const treesTexture = Texture.from(treesImg as string);
        // this.trees = new HorizontalTilingSprite(treesTexture);
        // this.trees.anchor.set(0,1)
        // this.trees.y = constants['gameHeight'];
        // this.trees.setWidth(constants['gameWidth']);
        // this.trees.setHeight(constants['gameHeight']/3)


        // const foregroundTreesTexture = Texture.from(foregroundTreesImg as string);
        // this.foregroundTrees = new HorizontalTilingSprite(foregroundTreesTexture);
        // this.foregroundTrees.anchor.set(0,1)
        // this.foregroundTrees.y = constants['gameHeight'];
        // this.foregroundTrees.setWidth(constants['gameWidth']);
        // this.foregroundTrees.setHeight(constants['gameHeight']/4)

        // this.addChild(this.background);
        this.addChild(this.farMountain);
        // this.addChild(this.mountains);
        // this.addChild(this.trees);
        // this.addChild(this.foregroundTrees);
    }

    public updateBackground(delta : number){
        // this.background.tilePosition.x -= delta*.08;
        this.farMountain.tilePosition.x -= delta*.1;
        // this.mountains.tilePosition.x -= delta*.2;
        // this.trees.tilePosition.x -= delta*.6;
        // this.foregroundTrees.tilePosition.x -= delta*1.2;
    }

    public resetBackgroundPosition(){
        // this.background.tilePosition.x = 0;
        this.farMountain.tilePosition.x = 0;
        // this.mountains.tilePosition.x = 0;
        // this.trees.tilePosition.x = 0;
        // this.foregroundTrees.tilePosition.x = 0;
    }

}

export default parallaxBackground;
