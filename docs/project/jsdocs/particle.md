<a name="Particle"></a>

## Particle
**Kind**: global class  

* [Particle](#Particle)
    * [new Particle(x, y, dirX, dirY, source, weight, lifetime, color, [gravitationallyAffected])](#new_Particle_new)
    * [.update(dT)](#Particle+update)

<a name="new_Particle_new"></a>

### new Particle(x, y, dirX, dirY, source, weight, lifetime, color, [gravitationallyAffected])
Constructor for creating a particle


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | The x position of the particle |
| y | <code>number</code> |  | The y position of the particle |
| dirX | <code>number</code> |  | x direction in which the particle is going to |
| dirY | <code>number</code> |  | y direction in which the particle is going to |
| source | <code>Entity</code> |  | The entity source of the particle |
| weight | <code>number</code> | <code>1</code> | How big the particle should be |
| lifetime | <code>number</code> | <code>5</code> | How long the particle should exist for |
| color | <code>number</code> | <code>16777215</code> | The color of the particle. This will vary. Argument can be provided in '0xRRGGBB' format |
| [gravitationallyAffected] | <code>boolean</code> | <code>true</code> | Whether or not the particle should be affected by gravity |

<a name="Particle+update"></a>

### particle.update(dT)
Update the states of the particle, and slowly make it age.
Also updates the position it, affects it with gravity (optional) and draws it.

**Kind**: instance method of [<code>Particle</code>](#Particle)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | Time difference since last frame, in seconds |

