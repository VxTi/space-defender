<a name="Alien"></a>

## Alien
**Kind**: global class  

* [Alien](#Alien)
    * [new Alien(x, y, size)](#new_Alien_new)
    * [.update(dT)](#Alien+update)

<a name="new_Alien_new"></a>

### new Alien(x, y, size)
Constructor for the Alien class.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | The x-coordinate of the Alien |
| y | <code>number</code> |  | The y-coordinate of the Alien |
| size | <code>number</code> | <code>50</code> | The size of the Alien |

<a name="Alien+update"></a>

### alien.update(dT)
Overwrite of the update method in the Entity class.
This will allow the Alien to follow the spaceship and attack it if it gets too close.

**Kind**: instance method of [<code>Alien</code>](#Alien)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | Time since last frame in seconds |

