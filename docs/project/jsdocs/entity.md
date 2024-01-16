<a name="Entity"></a>

## Entity
**Kind**: global class  

* [Entity](#Entity)
    * [new Entity(x, y, health, size)](#new_Entity_new)
    * [.pos](#Entity+pos)
    * [.update(dT)](#Entity+update)
    * [.terminate()](#Entity+terminate)
    * [.damage(amount)](#Entity+damage)
    * [.withinRange(other, [offset])](#Entity+withinRange)

<a name="new_Entity_new"></a>

### new Entity(x, y, health, size)
Constructor for the entity class.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | The x position of the entity |
| y | <code>number</code> |  | The y position of the entity |
| health | <code>number</code> |  | The health of the entity |
| size | <code>number</code> | <code>20</code> | The size of the entity |

<a name="Entity+pos"></a>

### entity.pos
Getter functions for private fields in this class.

**Kind**: instance property of [<code>Entity</code>](#Entity)  
<a name="Entity+update"></a>

### entity.update(dT)
Method for updating the entity's position and other properties.
This method is often overridden by subclasses.

**Kind**: instance method of [<code>Entity</code>](#Entity)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | Time difference since last frame, in seconds |

<a name="Entity+terminate"></a>

### entity.terminate()
Method for killing this entity.

**Kind**: instance method of [<code>Entity</code>](#Entity)  
<a name="Entity+damage"></a>

### entity.damage(amount)
Function for damaging this entity

**Kind**: instance method of [<code>Entity</code>](#Entity)  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>number</code> | How much to damage to deal to this entity |

<a name="Entity+withinRange"></a>

### entity.withinRange(other, [offset])
Method for checking whether another entity is within reach (for interaction)

**Kind**: instance method of [<code>Entity</code>](#Entity)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| other | [<code>Entity</code>](#Entity) |  | The entity to check the distance for |
| [offset] | <code>number</code> | <code>0</code> | The offset added to the distance check. This is for when one wants to implement additional reach for certain entities. |

