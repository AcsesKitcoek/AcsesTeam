# Three.js Lighting Fix Guide for GLB Models with Emissive Materials

## The Problem

When exporting GLB models from Blender with emissive materials that look great in Cycles render, they appear dark and unlit in three.js/react-three-fiber. This happens because:

1. **Emissive materials don't emit light in three.js** - they only make the mesh itself glow visually, but don't illuminate surrounding geometry [web:13][web:14][web:31]
2. **Blender's procedural shader nodes don't export** - values like "Light Path | Ray Depth" for metallic become 0 or undefined in three.js [web:18][web:27]
3. **Blender Cycles uses Global Illumination (GI)** - emissive surfaces bounce light realistically, but three.js has no runtime GI [web:13][web:19]
4. **Material properties export incorrectly** - roughness, metallic, and IOR values may not translate properly [web:7][web:18]

---

## The Solution: Two-Part Lighting System

### Part 1: Fix the Material (Make it Light-Receptive)

Your main building/environment material needs to:
- **Accept and reflect light** from three.js Light objects
- **Stay dark enough** to maintain the moody aesthetic
- **Have minimal self-illumination** to prevent pitch-black shadows

// In your useEffect where you traverse the scene:
if (child.material && child.material.name === 'YourMainMaterial') {
child.material = child.material.clone()

// KEY PROPERTIES:
child.material.metalness = 0.1         // Slight metallic (0-0.2 for subtle reflections)
child.material.roughness = 0.6         // Mid-range (0.5-0.7 for balanced light spread)
child.material.color = new THREE.Color('#2a2a2a')  // Dark gray (keep moody)

// Minimal self-illumination (prevents pure black)
child.material.emissive = new THREE.Color('#0a0a0a')
child.material.emissiveIntensity = 0.15  // 0.1-0.2 range

child.material.needsUpdate = true
}

**Material Property Reference:**

| Property | Range | Effect | Recommended |
|----------|-------|--------|-------------|
| `metalness` | 0-1 | 0 = diffuse, 1 = mirror | 0.0-0.2 (mostly diffuse) |
| `roughness` | 0-1 | 0 = glossy, 1 = matte | 0.5-0.7 (balanced) |
| `color` | hex | Base albedo/tint | Dark gray (#2a2a2a - #4a4a4a) |
| `emissive` | hex | Self-lit color | Very dark (#0a0a0a - #1a1a1a) |
| `emissiveIntensity` | 0+ | Glow strength | 0.1-0.3 (subtle) |

---

### Part 2: Add Real Three.js Lights

Emissive meshes need **companion pointLight/spotLight objects** at the same position to actually illuminate the scene.

// Example: Ceiling lights that should illuminate the room
const positions = []

// During scene traversal:
if (child.name.startsWith('Light_')) {
// Make the mesh itself glow
child.material = child.material.clone()
child.material.emissive = new THREE.Color('#ffffff')
child.material.emissiveIntensity = 3
child.material.toneMapped = false

// Store position for real light
const worldPos = new THREE.Vector3()
child.getWorldPosition(worldPos)
positions.push(worldPos.clone())
}

// Then in your JSX, create actual lights:
{positions.map((pos, index) => (
<pointLight
key={light-${index}}
position={[pos.x, pos.y - 0.8, pos.z]}
intensity={80} // Adjust based on scale
distance={25} // How far light reaches
decay={1.5} // Falloff rate (1-2 is realistic)
color="#ffffff"
castShadow
/>
))}

**Light Property Reference:**

| Property | Effect | Typical Values |
|----------|--------|----------------|
| `intensity` | Brightness | 50-200 (scale-dependent) |
| `distance` | Max reach (0 = infinite) | 20-50 for rooms |
| `decay` | Falloff rate | 1 = linear, 2 = realistic, 0 = none |
| `castShadow` | Enables shadows | true for main lights |

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Too Much Ambient Light
// BAD - washes out everything
<ambientLight intensity={1.0} />
<directionalLight intensity={1.5} />

// GOOD - lets point lights create contrast
<ambientLight intensity={0.1} color="#0a0a1a" />
<directionalLight intensity={0.3} />

### ❌ Mistake 2: Making Material Too Bright
// BAD - loses dark aesthetic
child.material.color = new THREE.Color('#888888') // Too bright
child.material.emissiveIntensity = 0.4 // Too strong

// GOOD - keeps moody look
child.material.color = new THREE.Color('#2a2a2a') // Dark
child.material.emissiveIntensity = 0.15 // Subtle

### ❌ Mistake 3: Wrong Light Distance/Decay
// BAD - lights don't reach far enough
intensity={8}
distance={10}
decay={2}

// GOOD - properly illuminates space
intensity={80}
distance={25}
decay={1.5}

### ❌ Mistake 4: Forgetting toneMapped
// BAD - bloom won't work on emissive
child.material.emissive = new THREE.Color('#00ffff')
child.material.emissiveIntensity = 5

// GOOD - bright emissive bypasses tone mapping for bloom
child.material.emissive = new THREE.Color('#00ffff')
child.material.emissiveIntensity = 5
child.material.toneMapped = false // Essential for glow

---

## Complete Lighting Setup Checklist

### In TeamsBuilding.jsx (or your model component):

- [ ] Clone and modify main structure material
  - [ ] Set metalness: 0.1
  - [ ] Set roughness: 0.6
  - [ ] Set dark color: #2a2a2a
  - [ ] Set minimal emissive: #0a0a0a with intensity 0.15

- [ ] Make emissive meshes glow (lights, signs, screens)
  - [ ] Set emissive color (white for lights, cyan for accents)
  - [ ] Set emissiveIntensity: 2-5
  - [ ] Set toneMapped: false

- [ ] Add real pointLight for each emissive light fixture
  - [ ] intensity: 80
  - [ ] distance: 25
  - [ ] decay: 1.5
  - [ ] castShadow: true

- [ ] Add minimal ambient light
  - [ ] intensity: 0.1-0.15
  - [ ] color: dark blue (#0a0a1a)

### In App.jsx (Canvas component):

- [ ] Reduce scene ambient light to 0.1
- [ ] Reduce directional light to 0.3
- [ ] Keep Bloom post-processing for glow effect
  - [ ] intensity: 1.5-2.0
  - [ ] luminanceThreshold: 0.7
  - [ ] radius: 0.6-0.8

---

## Debugging Tips

### If floors are still too dark:
1. Increase pointLight `intensity` (try 100-150)
2. Increase pointLight `distance` (try 30-40)
3. Lower `decay` (try 1.0 or even 0)
4. Add small emissive to floor material directly

### If scene is too bright/washed out:
1. Lower Canvas ambient light (try 0.05)
2. Darken material base color (try #1a1a1a)
3. Lower emissiveIntensity on main material (try 0.1)
4. Reduce pointLight intensity

### If emissive objects don't glow:
1. Ensure `toneMapped = false` on emissive materials
2. Check Bloom luminanceThreshold (lower = more glow)
3. Increase emissiveIntensity (3-5 range)
4. Verify EffectComposer is enabled

### If lights flicker or disappear:
1. Check light positions are in world space
2. Ensure lights aren't inside geometry
3. Verify distance covers intended area
4. Check shadow map size if using castShadow

---

## Why This Works

**The Core Principle:**
> In three.js, emissive materials are visual-only. Real illumination requires Light objects. The material must be configured to receive and reflect light from those Light objects.

**The Balance:**
- **Dark base color** preserves aesthetic
- **Low roughness** spreads light naturally  
- **Minimal emissive** prevents pure black without washing out
- **Strategic pointLights** create localized illumination zones
- **Low ambient** maintains contrast and drama

---

## Quick Reference: Material Values

### For Dark Cyberpunk/Moody Scenes:
metalness: 0.1
roughness: 0.6
color: '#2a2a2a'
emissive: '#0a0a0a'
emissiveIntensity: 0.15

### For Bright Clean Scenes:
metalness: 0.0
roughness: 0.7
color: '#ffffff'
emissive: '#0a0a0a'
emissiveIntensity: 0.1

### For Reflective/Metallic Surfaces:
metalness: 0.8
roughness: 0.2
color: '#404040'
emissive: '#000000'
emissiveIntensity: 0.0

---

## Resources

- Three.js MeshStandardMaterial docs: https://threejs.org/docs/#api/en/materials/MeshStandardMaterial
- Three.js PointLight docs: https://threejs.org/docs/#api/en/lights/PointLight
- React Three Fiber lights: https://docs.pmnd.rs/react-three-fiber/api/objects#lights
- PBR material theory: https://learnopengl.com/PBR/Theory

---

**Remember:** three.js is a real-time rasterizer, not a path tracer like Cycles. You're faking the look of global illumination through careful material setup and strategic light placement. Adjust values iteratively until you match your Blender preview.