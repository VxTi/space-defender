## Constants

<dl>
<dt><a href="#Statistics">Statistics</a></dt>
<dd><p>Object containing all the statistical properties of the spaceship.
These can be viewed in the &#39;statistics&#39; tab in-game.</p>
</dd>
<dt><a href="#PlayerData">PlayerData</a> : <code>Object</code></dt>
<dd><p>Object containing all the scores of the player.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#setup">setup()</a></dt>
<dd><p>Main setup method. Here we load resources and initialize variables.</p>
</dd>
<dt><a href="#draw">draw()</a></dt>
<dd><p>Main Rendering loop</p>
</dd>
<dt><a href="#introduceWave">introduceWave(wave)</a></dt>
<dd><p>Method for introducing a new entity wave into the game.
This method is called when the player has killed all entities in the current wave.</p>
</dd>
<dt><a href="#checkEntitySpawning">checkEntitySpawning()</a></dt>
<dd><p>Function for checking whether an entity can spawn or not
Occasionally introduces new entities.</p>
</dd>
<dt><a href="#scoreUpdater">scoreUpdater()</a></dt>
<dd><p>Function for updating the score of the player.
This only works when the player has selected a name for themselves,
and one is connected to the internet.</p>
</dd>
<dt><a href="#performExplosion">performExplosion()</a></dt>
<dd><p>Method for performing the explosion effect once the explosion progress has reached 100%
This method checks which entities are within range of the explosion, and damages them accordingly.
Also introduces particles into space.</p>
</dd>
<dt><a href="#startGame">startGame()</a></dt>
<dd><p>Method for starting the game and configuring the right variables</p>
</dd>
<dt><a href="#requestApi">requestApi(param, content)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Method for making an API request to the server.</p>
</dd>
<dt><a href="#respawn">respawn()</a></dt>
<dd><p>Method for respawning the player and resetting some variables.</p>
</dd>
<dt><a href="#randDir">randDir(thetaMin, thetaMax, rMin, rMax)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Method for retrieving a random direction vector.</p>
</dd>
<dt><a href="#showDeathAnimation">showDeathAnimation(entity)</a></dt>
<dd><p>Method for showing a death animation for given entity.</p>
</dd>
<dt><a href="#showHurtAnimation">showHurtAnimation(entity)</a></dt>
<dd><p>Method for showing hurt animation.
This is the same as the method above, with as only difference that the
amount of released particles is less.</p>
</dd>
<dt><a href="#setScore">setScore(score, [wave])</a></dt>
<dd><p>Function for setting the score of the user
Also updates the high score if the score is higher than the current high score</p>
</dd>
<dt><a href="#addScore">addScore(score, [e])</a></dt>
<dd><p>Function for adding score of the player</p>
</dd>
<dt><a href="#playSound">playSound(sound)</a></dt>
<dd><p>Method for playing a sound effect</p>
</dd>
<dt><a href="#drawRect">drawRect(x, y, width, height, rgb, opacity)</a></dt>
<dd><p>Method for drawing a rectangle onto the screen with provided color values</p>
</dd>
<dt><a href="#drawLine">drawLine(x0, y0, x1, y1, [rgb], [thickness])</a></dt>
<dd><p>Method for drawing a line with multiple parameters.</p>
</dd>
<dt><a href="#drawSegmentedLine">drawSegmentedLine(x0, y0, x1, y1, rgb, thickness)</a></dt>
<dd><p>Method for drawing a dotted line, old-school style</p>
</dd>
</dl>

<a name="Statistics"></a>

## Statistics
Object containing all the statistical properties of the spaceship.
These can be viewed in the 'statistics' tab in-game.

**Kind**: global constant  
<a name="PlayerData"></a>

## PlayerData : <code>Object</code>
Object containing all the scores of the player.

**Kind**: global constant  
<a name="setup"></a>

## setup()
Main setup method. Here we load resources and initialize variables.

**Kind**: global function  
<a name="setup..stars"></a>

### setup~stars
-- FUNCTIONALITY -- BACKGROUND STARS --

**Kind**: inner property of [<code>setup</code>](#setup)  
<a name="draw"></a>

## draw()
Main Rendering loop

**Kind**: global function  
<a name="introduceWave"></a>

## introduceWave(wave)
Method for introducing a new entity wave into the game.
This method is called when the player has killed all entities in the current wave.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| wave | <code>number</code> | The wave number to introduce |

<a name="checkEntitySpawning"></a>

## checkEntitySpawning()
Function for checking whether an entity can spawn or not
Occasionally introduces new entities.

**Kind**: global function  
<a name="scoreUpdater"></a>

## scoreUpdater()
Function for updating the score of the player.
This only works when the player has selected a name for themselves,
and one is connected to the internet.

**Kind**: global function  
<a name="performExplosion"></a>

## performExplosion()
Method for performing the explosion effect once the explosion progress has reached 100%
This method checks which entities are within range of the explosion, and damages them accordingly.
Also introduces particles into space.

**Kind**: global function  
<a name="startGame"></a>

## startGame()
Method for starting the game and configuring the right variables

**Kind**: global function  
<a name="requestApi"></a>

## requestApi(param, content) ⇒ <code>Promise.&lt;Object&gt;</code>
Method for making an API request to the server.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>string</code> | The appropriate URL parameter for the request |
| content | <code>object</code> | The content to send to the server |

<a name="respawn"></a>

## respawn()
Method for respawning the player and resetting some variables.

**Kind**: global function  
<a name="randDir"></a>

## randDir(thetaMin, thetaMax, rMin, rMax) ⇒ <code>Array.&lt;number&gt;</code>
Method for retrieving a random direction vector.

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Direction vector in the form [x, y]  

| Param | Description |
| --- | --- |
| thetaMin | Minimum angle (in radians) |
| thetaMax | Maximum angle (in radians) |
| rMin | Minimum radius (in pixels) |
| rMax | Maximum radius (in pixels) |

<a name="showDeathAnimation"></a>

## showDeathAnimation(entity)
Method for showing a death animation for given entity.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| entity | <code>Entity</code> | The entity in question that's died. |

<a name="showHurtAnimation"></a>

## showHurtAnimation(entity)
Method for showing hurt animation.
This is the same as the method above, with as only difference that the
amount of released particles is less.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| entity | <code>Entity</code> | The entity for which to show the hurt animation |

<a name="setScore"></a>

## setScore(score, [wave])
Function for setting the score of the user
Also updates the high score if the score is higher than the current high score

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| score | <code>number</code> | new score |
| [wave] | <code>number</code> | The wave the player is on |

<a name="addScore"></a>

## addScore(score, [e])
Function for adding score of the player

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| score | <code>number</code> |  | How much score to add |
| [e] | <code>Entity</code> | <code></code> | Source from which the score was added |

<a name="playSound"></a>

## playSound(sound)
Method for playing a sound effect

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| sound | <code>string</code> | Name of the sound effect to play |

<a name="drawRect"></a>

## drawRect(x, y, width, height, rgb, opacity)
Method for drawing a rectangle onto the screen with provided color values

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | screen x-coordinate |
| y | <code>number</code> |  | screen y-coordinate |
| width | <code>number</code> |  | width of the rectangle |
| height | <code>number</code> |  | height of the rectangle |
| rgb | <code>number</code> |  | Color value. Can be provided as '0xRRGGBB' where [R, G, B] are in base-16 |
| opacity | <code>number</code> | <code>1</code> | Opacity of the rectangle |

<a name="drawLine"></a>

## drawLine(x0, y0, x1, y1, [rgb], [thickness])
Method for drawing a line with multiple parameters.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x0 | <code>number</code> |  | starting x-position |
| y0 | <code>number</code> |  | starting y-position |
| x1 | <code>number</code> |  | second x-position |
| y1 | <code>number</code> |  | second y-position |
| [rgb] | <code>number</code> | <code>16777215</code> | Color of the line, given as a number. Parameter can be provided as '0xRRGGBB', where the letters denote hexadecimal values for RGB |
| [thickness] | <code>number</code> | <code>1</code> | Thickness of the line |

<a name="drawSegmentedLine"></a>

## drawSegmentedLine(x0, y0, x1, y1, rgb, thickness)
Method for drawing a dotted line, old-school style

**Kind**: global function  

| Param | Description |
| --- | --- |
| x0 | first x-coordinate |
| y0 | first y-coordinate |
| x1 | second x-coordinate |
| y1 | second y-coordinate |
| rgb | Color to draw |
| thickness | Size of each segments |

