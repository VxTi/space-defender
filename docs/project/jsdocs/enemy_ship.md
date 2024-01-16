<a name="EnemyShip"></a>

## EnemyShip
**Kind**: global class  

* [EnemyShip](#EnemyShip)
    * [new EnemyShip(x, y, size)](#new_EnemyShip_new)
    * [.update(dT)](#EnemyShip+update)

<a name="new_EnemyShip_new"></a>

### new EnemyShip(x, y, size)
Constructor for the enemy ship


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | X position of the enemy ship |
| y | <code>number</code> |  | Y position of the enemy ship |
| size | <code>number</code> | <code>70</code> | Size of the enemy ship (in pixels), defaults to 70 |

<a name="EnemyShip+update"></a>

### enemyShip.update(dT)
Overridden update method for the enemy ship.

**Kind**: instance method of [<code>EnemyShip</code>](#EnemyShip)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | Time difference since last frame, in seconds |

