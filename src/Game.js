import { DynamicElement } from './DynamicElement'

import tutorial from './maps/tutorial'
import level1 from './maps/level1'
import level2 from './maps/level2'
import level3 from './maps/level3'
import { Road } from './elements/Road'
import { CustomError } from './CustomError'
import { ElementOutOfMapError } from './CustomError'
import { PushOutOfMapError } from './CustomError'


export class Game {

    /**
     * 
     * @param {HTMLElement} el game base element
     * @param {String} assetsBasePath 
     */
    constructor(el, assetsBasePath) {

        this.el = el
        this.assetsBasePath = assetsBasePath

        // Some shortcuts
        this.HEIGHT = this.el.offsetHeight
        this.WIDTH = this.el.offsetWidth

        this.objectives = 0
        this.level = 0
        this.mapElement = []

        // Map p5 functions to our game functions
        let s = (sketch) => {
            // Allow to acces the p5 sketch into our game class
            this.sketch = sketch
            sketch.preload = () => { this.preload() }
            sketch.setup = () => { this.setup() }
            sketch.draw = () => { this.draw() }
            sketch.keyPressed = () => { this.keyPressed() }

        }

        // Initialize p5
        this.myp5 = new window.p5(s, this.el)

    }

    preload(mapName) {
        // Create PokedashGame's classes attribute amongst element found in the map to load in param
        // Example: Create this.protagonist and this.protagonistImg
        if(mapName == undefined) mapName = tutorial
        console.log("------------ PRELOAD() ------------")
        console.log(mapName)
        for (let ele in mapName.e) {
            let eName = mapName.e[ele].name.toLowerCase()
            console.log("eName: " + eName)

            this[eName] = null//with ele = 0 -> this.protagonist = null
            if (eName == 'road') this[eName + "Img"] = null //Not rendering the road (just the background). Easier to handle
            else this[eName + "Img"] = this.sketch.loadImage(`${this.assetsBasePath}/${eName}Img.png`) // -> this.protagonistImg = loadImg(assets/protagonistImg.png)
        }
    }

    setup(mapName) {
        if(mapName == undefined) mapName = tutorial
        console.log("SSSSSSSSSS", mapName)
        // Define dimension of the map and of each block
        console.log("------------ SETUP() ------------")
        this.sketch.createCanvas(this.HEIGHT, this.WIDTH)
        this.columns = mapName.pattern.length
        this.rows = mapName.pattern[0].length
        this.blockHeight = this.sketch.floor(this.HEIGHT / this.rows)
        this.blockWidth = this.sketch.floor(this.WIDTH / this.columns)
        // new Element()
        this.iterateOverMap(mapName)
    }

    draw() {
        this.sketch.background("#5E3F6B");
        for (let y = 0; y < this.columns; y++) {
            for (let x = 0; x < this.rows; x++) {
                if (this.mapElement[x][y].constructor.name == 'Road') continue
                else this.mapElement[x][y].show()
            }
        }
    }

    //Function to iterate through the pattern map to fill the array map
    iterateOverMap(mapName) {
        if(mapName == undefined) mapName = tutorial
        //Instantiate 2d array in mapElement
        for (let i = 0; i < this.rows; i++) {
            this.mapElement[i] = new Array(this.columns)
        }
        console.log("------------ ITERATEOVERMAP() ------------")
        for (let y = 0; y < this.columns; y++) {
            for (let x = 0; x < this.rows; x++) {
                // Instantiate objects in the 2D array
                let idElement = mapName.pattern[y][x]
                let element = mapName.e[idElement].name
                let elementImg = element.toLowerCase() + 'Img'
                this.mapElement[x][y] = new DynamicElement(this, element, x * this.blockWidth, y * this.blockHeight, this[elementImg])

                // Récupère la position du joueur dans le tableau d'objet
                if (this.mapElement[x][y].isProtagonist) {
                    this.protagonist = this.mapElement[x][y]
                }

                // Récupère le nombre d'objectifs dans le jeu
                if (this.mapElement[x][y].isObjective) {
                    this.objectives += 1
                }

                if (this.mapElement[x][y].constructor.name == "Door") {
                    this.door = this.mapElement[x][y]
                }
            }
        }
    }

    // Functions for user
    getObjectives() {
        return this.objectives
    }

    takeObjective() {
        this.objectives -= 1
        this.mapElement[this.pokeball.posX][this.pokeball.posY] = new Road(this, this.pokeball.x, this.pokeball.y, 'roadImg')
        //this.mapElement[this.pokeball.posX][this.pokeball.posY].remove()
    }
    isDoorOpen(){
        return this.mapElement[this.door.posX][this.door.posY].isOpen
    }
    openDoor() {
        if (this.objectives != 0) throw "You can't open door while there is still existing objective"
        this.mapElement[this.door.posX][this.door.posY].open()
        return true
    }

    closeDoor() {
        this.mapElement[this.doorPosX][this.doorPosY].close()
        return true
    }

    nextLevel(){
        if(!this.isDoorOpen()) throw "LA PORTE EST FERMEE"
        console.log("* * * * YOU WIN * * * *")
        this.level += 1
        let mapName = null
        switch(this.level){
            case 1:
                mapName = level1
            break

            case 2:
                mapName = level2
            break

            case 3:
                mapName = level3
            break

            default:
                mapName = tutorial
            break
        }
        this.preload(mapName)
        this.setup(mapName)
    }


    // Get element from protagonist
    getElement(direction, distance, optionnal) {
        if (distance < 0) return false

        let x = this.protagonist.posX
        let y = this.protagonist.posY
        let element = null
        if (direction === 'left' || direction === this.sketch.LEFT_ARROW) {
            if (x < 0 + distance) throw new ElementOutOfMapError // If it's out of the map
            element = this.mapElement[x - distance][y]
            if (element.isObjective) this.pokeball = element
        }

        else if (direction === 'right' || direction === this.sketch.RIGHT_ARROW) {
            if (x >= this.columns - distance) throw new ElementOutOfMapError // If it's out of the map
            element = this.mapElement[x + distance][y]
            if (element.isObjective) this.pokeball = element
        }

        else if (direction === 'up' || direction === this.sketch.UP_ARROW) {
            if (y < 0 + distance) throw new ElementOutOfMapError // If it's out of the map
            element = this.mapElement[x][y - distance]
            if (element.isObjective) this.pokeball = element
        }

        else if (direction === 'down' || direction === this.sketch.DOWN_ARROW) {
            if (y >= this.rows - distance) throw new ElementOutOfMapError // If it's out of the map
            element = this.mapElement[x][y + distance]
            if (element.isObjective) this.pokeball = element
        }
        else return null


        if (optionnal == 'admin') return element

        return element.constructor.name.toString() // Return the name of the class's element in string
    }

    swapSprite(direction, distanceFrom, distanceTo) {
        if (distanceFrom > distanceTo) {
            throw "Parameter 'distanceTo' has to be >= than 'distanceFrom'"
        }
        let x = this.protagonist.posX
        let y = this.protagonist.posY
        let s = this.sketch

        if (direction === 'right' || direction === s.RIGHT_ARROW) {
            if (x + distanceFrom > this.columns - distanceTo) throw new PushOutOfMapError
            let temp = this.mapElement[x + distanceFrom][y]
            this.mapElement[x + distanceFrom][y] = this.mapElement[x + distanceTo][y]
            this.mapElement[x + distanceTo][y] = temp
        }
        if (direction === 'left' || direction === s.LEFT_ARROW) {
            if (x - distanceFrom <= 0) throw new PushOutOfMapError
            let temp = this.mapElement[x - distanceFrom][y]
            this.mapElement[x - distanceFrom][y] = this.mapElement[x - distanceTo][y]
            this.mapElement[x - distanceTo][y] = temp
        }
        if (direction === 'down' || direction === s.DOWN_ARROW) {
            if (y + distanceFrom > this.rows - distanceTo) throw new PushOutOfMapError
            let temp = this.mapElement[x][y + distanceFrom]
            this.mapElement[x][y + distanceFrom] = this.mapElement[x][y + distanceTo]
            this.mapElement[x][y + distanceTo] = temp
        }
        if (direction === 'up' || direction === s.UP_ARROW) {
            if (y - distanceFrom <= 0) throw new PushOutOfMapError
            let temp = this.mapElement[x][y - distanceFrom]
            this.mapElement[x][y - distanceFrom] = this.mapElement[x][y - distanceTo]
            this.mapElement[x][y - distanceTo] = temp
        }
        this.refreshPos()
    }

    keyPressed() {
        let s = this.sketch

        if (s.keyCode === s.LEFT_ARROW || s.keyCode === s.RIGHT_ARROW || s.keyCode === s.UP_ARROW || s.keyCode === s.DOWN_ARROW) {
            
            let element = this.getElement(s.keyCode, 1)
            console.log("element: ", element)
            switch (element) {
                case "Road":
                    this.swapSprite(s.keyCode, 0, 1)
                    break

                case "Boulder":
                    if (this.getElement(s.keyCode, 2) != "Road") break
                    this.swapSprite(s.keyCode, 1, 2)
                    this.swapSprite(s.keyCode, 0, 1)
                    break

                case "Pokeball":
                    this.takeObjective()
                    this.swapSprite(s.keyCode, 0, 1)
                    if (this.getObjectives() == 0) {
                        this.openDoor()
                    }
                    break

                case "Door":
                    if(this.isDoorOpen()) this.nextLevel()
                break
            }
        }

        return true
    }

    refreshPos() {
        for (let y = 0; y < this.columns; y++) {
            for (let x = 0; x < this.rows; x++) {
                // Refresh pos X and Y
                this.mapElement[x][y].x = x * this.blockWidth
                this.mapElement[x][y].posX = x
                this.mapElement[x][y].y = y * this.blockHeight
                this.mapElement[x][y].posY = y
            }
        }
    }


    /**
     * @param {string} command
     * @return {string} command output
     */
    executeGameCommand(command) {
        // Execute the command in your game and return the result
        return true
    }
}