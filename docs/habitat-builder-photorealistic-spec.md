# BlackWaterLeaf Habitat Builder – Photorealistic Implementation Specification

## Status and product decision

The earlier standalone concept is **not suitable for integration in its existing form**. Its primitive WebGL geometry reads as a stylized configurator and must **not** be deployed inside BlackWaterLeaf. The integrated feature must be a photorealistic habitat visualizer whose assets and presentation meet BlackWaterLeaf's premium, naturalistic visual standard.

The target route is **`/aquariums/builder`**, embedded inside the existing `AppLayout`. A visible CTA belongs on `/aquariums`, placed beside the existing “Aquarium hinzufügen” action. The existing Aquarium creation and detail flows remain unchanged; this is a distinct exploratory planning space until persistence is explicitly added.

## Visual standard

> The habitat must be recognizably made of real-world materials at a normal viewing distance: true-to-life leaf silhouettes and venation, believable translucency, root fibres, irregular stone surfaces, leaf litter, water caustics, condensation, physically plausible scale, and natural plant clustering. Generic spheres, cones, dodecahedra or low-poly stand-ins are forbidden in the customer-facing scene.

| Area | Required standard |
| --- | --- |
| **Plant assets** | Licensed, PBR `glb` / `gltf` plants with high-quality geometry and albedo, normal, roughness and translucency maps. Favour native aquatic species such as *Anubias barteri*, *Microsorum pteropus*, *Bucephalandra*, *Cryptocoryne* and leaf litter; tropical terrarium assets include fern, moss, bromeliad and cork bark. |
| **Hardscape** | Scan-quality driftwood, botanical leaf litter, river stones and substrate. Use physically based material maps, not procedural primitives. |
| **Light** | HDRI or dedicated lighting rig with ACES filmic tone mapping, soft contact shadows, water/foliage light response and a restrained BlackWaterLeaf emerald/amber grade. |
| **Aquarium detail** | Transparent glass with believable thickness and reflection; tea-coloured blackwater; a slow optional particulate/bubble layer. Animals should be high-fidelity animated assets or omitted—never use toy-like fish geometry. |
| **Terrarium detail** | Glass reflections, fog/condensation layer, bark, drainage/substrate strata and a humid dappled-light environment. |
| **Camera** | Portrait/landscape composition comparable to premium aquascaping photography. Orbit is allowed, but presets should protect the showcase view. |
| **UI** | Continue the BlackWaterLeaf glassmorphism, emerald/gold accents, `Playfair Display` and `Bebas Neue` hierarchy. The scene remains the focal point. |

## 4K/8K interpretation and runtime budget

“4K/8K” must describe the **source fidelity**, not an unconditional live render buffer. A browser canvas at 8K consumes too much GPU memory and risks failure on mobile hardware. Use **4K source textures for hero assets**, retain optional 8K source masters only for offline stills, and serve compressed variants at runtime.

| Deliverable | Requirement |
| --- | --- |
| **Interactive web scene** | Device-adaptive canvas. Render pixel ratio should be clamped to `Math.min(window.devicePixelRatio, 2)`; expose a quality setting only after a baseline scene is stable. |
| **Textures** | 4K PBR source files, transcoded to KTX2/BasisU or platform-appropriate compressed variants. Prefer 2K runtime textures on phones/tablets, 4K on fast desktop GPUs. |
| **Showcase stills** | Offer an optional client-side “4K Snapshot” mode only if the user’s device can render it; otherwise create a server-side/offline renderer. |
| **Scene performance** | First visible frame under 3 seconds on a normal desktop connection; progressive loading; the page must remain usable while models load. Use `Suspense`, `drei` loaders, and glTF/KTX2 compression. |
| **Mobile fallback** | A curated high-resolution still with the same plan controls remains acceptable only where WebGL is unavailable or runtime performance fails. |

## Required integration files

```
client/src/pages/HabitatBuilder.tsx
client/src/components/habitat/HabitatScene.tsx
client/src/components/habitat/HabitatAssetLibrary.ts
client/src/components/habitat/HabitatConfigurator.tsx
client/src/components/habitat/HabitatLoadingFallback.tsx
client/src/components/habitat/habitatBuilder.css
```

The model manifest must be the only source of asset URLs and semantic tags. It should use object keys such as `anubias`, `javaFern`, `bucephalandra`, `driftwood`, `riverStone`, `leafLitter`, `bromeliad`, and `corkBark`; every asset record needs `id`, `label`, `category`, `url`, `thumbnailUrl`, `placement`, `scaleRange`, `habitat`, `license`, `sourceResolution`, and `runtimeTextureTier`.

## Existing application integration

1. Add `import HabitatBuilder from "./pages/HabitatBuilder";` to `client/src/App.tsx`.
2. Register the route *before* the dynamic `"/aquariums/:id"` route:

```tsx
<Route path="/aquariums/builder">
  <AppLayout><HabitatBuilder /></AppLayout>
</Route>
```

3. Add a “3D planen” link to `client/src/pages/Aquariums.tsx` next to the existing create action. It must lead to `/aquariums/builder` and be accessible to guests as an exploratory tool.
4. Reuse `Seo` with `path="/aquariums/builder"` and a noindex flag until final SEO copy, an OG image, and content approval exist.
5. Use `three`, `@react-three/fiber`, `@react-three/drei` and `@types/three`; these dependencies are already staged on branch `feature/habitat-builder`.
6. Do not alter database schemas, `server/routers.ts`, user data or marketplace transactions in the initial integration. Use the existing `/marketplace` route for a transparent handoff and show no fictional product prices, stock or checkout behaviour.

## Interaction design

The builder begins with a choice between **Schwarzwasser-Aquarium** and **Regenwald-Terrarium**. Its inspector groups assets by `Hardscape`, `Substrat & Biotop`, `Bepflanzung`, `Technik` and, only after animal-specific validation exists, `Besatz`. Selection must alter the scene, summary and transparent needs list together. The day-cycle slider should change lighting and, in terrarium mode, visual humidity—not fake scientific measurements.

The action area contains “Entwurf exportieren” and “Zum Marktplatz”. The latter navigates internally to `/marketplace`; all partner offers are external only after they exist in the marketplace backend and must retain the current disclosure language.

## Acceptance checklist

- [ ] No primitive low-poly plants, fish, rocks or wood are visible in the customer scene.
- [ ] Every visible biological asset has a species/material label and documented asset licence.
- [ ] Blackwater, glass, roots, substrate and plants read as natural materials at desktop resolution.
- [ ] The 3D scene has loading, error and WebGL fallback states.
- [ ] Asset selection updates the scene and needs list without resetting unrelated choices.
- [ ] Aquarium and terrarium modes are both implemented and visually distinct.
- [ ] The existing `/aquariums/new`, `/aquariums/:id`, `/marketplace` and authentication paths remain unchanged.
- [ ] `pnpm run check`, `pnpm run test` and `pnpm run build` pass before deployment.

## Asset acquisition policy

Before implementation, obtain an explicit asset manifest. Use self-created or correctly licensed assets only. Record creator/provider, licence, attribution requirement, source resolution, original file location and web-optimized derived file location. Do not scrape assets from marketplace images or use unlicensed Sketchfab/Google images. A final production asset pack should be reviewed visually against premium aquascaping and vivarium reference photography before integration.
