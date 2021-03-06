<?php
 /*
    Author : Julien Richoz
    Date: 20.03.2019
    
    Description: A php file solution to have a playable Pokedash Game with the arrows keys.
    
    Be careful of :
        - The functions from PokedashGame are send to a server, which return only string.
        - Don't forget to convert some response from string to the appropriate type (string to int for example).
        - Take care of boolean response ! If you need to check if it's true or false in a Pokedash function, stringify the boolean ! -> if($test == 'true')  
*/

// Get the size of the map
define('LIMX', getMapSizeX());
define('LIMY', getMapSizeY());

// Set a distance to do an action from the protagonist (example: move 1 case)
define('DIST', 1);

// Infinite loop to handle arroy key event
while (true) {
    // Get the direction from the key pressed
    $dir = (int)waitUntilKeyPressed();

    // Get the current position of the protagonist
    $x = getPosX();
    $y = getPosY();

    // Check if the action we are going to perform will happen in the map array
    if (isInMap($x, $y, LIMX, LIMY, $dir, DIST) == 'true') { // The boolean has to be in string (server response)

        // Checking the element next to the protagonist to do a specific action :
        $element = getElement($dir, DIST);
        switch ($element) {
                // Moving Pikachu 1 case
            case 'Road':
                swapSprite($dir, 0, DIST);
                break;

                //If we can push boulder, move boulder and pikachu one case further 
            case 'Boulder':
                if (isInMap($x, $y, LIMX, LIMY, $dir, DIST + 1) == 'true') {
                    if (getElement($dir, DIST + 1) != "Road") break;
                    swapSprite($dir, DIST, DIST + 1); //Swapping the boulder with the road
                    swapSprite($dir, 0, DIST); // Swapping the protagonist with the road
                }
                break;

                // Take the objective
            case 'Objective':
                takeObjective();
                swapSprite($dir, 0, DIST);
                // Open the door is no objective left
                if (getObjectives() == 0) {
                    openDoor();
                }
                break;

                // If the door is open, access to the next level
            case 'Door':
                if (isDoorOpen()) {
                    nextLevel();
                }
                break;
        }
    }
}
