<a name="Rocket"></a>

## Rocket
Class for creating a rocket, fired by the user.
This rocket can damage malevolent entities.

**Kind**: global class  

* [Rocket](#Rocket)
    * [new Rocket(source, damage)](#new_Rocket_new)
    * [.update(dT)](#Rocket+update)

<a name="new_Rocket_new"></a>

### new Rocket(source, damage)
Constructor for creating a new rocket.
Rocket must be coming from a spaceship (obviously)


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| source | <code>Spaceship</code> |  | The spaceship that shoots the rocket |
| damage | <code>number</code> | <code>1</code> | The amount of damage the rocket deals |

<a name="Rocket+update"></a>

### rocket.update(dT)
Overridden method for updating the rocket and its properties.

**Kind**: instance method of [<code>Rocket</code>](#Rocket)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | The time passed since last frame, in seconds |

