<a name="Spaceship"></a>

## Spaceship
**Kind**: global class  

* [Spaceship](#Spaceship)
    * [new Spaceship(x, y, health)](#new_Spaceship_new)
    * [.facing](#Spaceship+facing) ⇒ <code>number</code>
    * [.update(dT)](#Spaceship+update)
    * [.onDamage(amount)](#Spaceship+onDamage)
    * [.onEntityKill(entity)](#Spaceship+onEntityKill)
    * [.shoot()](#Spaceship+shoot)
    * [.onDeath()](#Spaceship+onDeath)

<a name="new_Spaceship_new"></a>

### new Spaceship(x, y, health)
Constructor for the spaceship.


| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The x coordinate of the spaceship. |
| y | <code>number</code> | The y coordinate of the spaceship. |
| health | <code>number</code> | The health of the spaceship. |

<a name="Spaceship+facing"></a>

### spaceship.facing ⇒ <code>number</code>
Getter for the facing direction of the spaceship.

**Kind**: instance property of [<code>Spaceship</code>](#Spaceship)  
**Returns**: <code>number</code> - The facing direction of the spaceship.  
<a name="Spaceship+update"></a>

### spaceship.update(dT)
Method for updating the spaceship's properties and drawing it on the screen.
Also moves the screen once the player comes too close to it.

**Kind**: instance method of [<code>Spaceship</code>](#Spaceship)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | The time passed since the last update, in seconds. |

<a name="Spaceship+onDamage"></a>

### spaceship.onDamage(amount)
Method for handling the damage to the spaceship.
This happens when the spaceship is hit by another entity or rock.
Updates the statistics and plays a sound.

**Kind**: instance method of [<code>Spaceship</code>](#Spaceship)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | The amount of damage dealt to the spaceship. |

<a name="Spaceship+onEntityKill"></a>

### spaceship.onEntityKill(entity)
Method for handling the killing of another entity.
This happens when a rocket launched by this spaceship hits another entity.

**Kind**: instance method of [<code>Spaceship</code>](#Spaceship)  

| Param | Type | Description |
| --- | --- | --- |
| entity | <code>Entity</code> | The entity that was killed. |

<a name="Spaceship+shoot"></a>

### spaceship.shoot()
Method for shooting a rocket.
This introduces a rocket into the game, updates the statistics and plays a sound.

**Kind**: instance method of [<code>Spaceship</code>](#Spaceship)  
<a name="Spaceship+onDeath"></a>

### spaceship.onDeath()
Method for handling the death of the spaceship.
This method plays a sound, updates the statistics, displays text and respawns the spaceship.

**Kind**: instance method of [<code>Spaceship</code>](#Spaceship)  
