# Copy/Paste Handoff for the Deployment Chat

Paste the following message into the chat that has access to the BlackWaterLeaf deployment project or repository:

```text
Integrate the photorealistic BlackWaterLeaf Habitat Builder from GitHub branch `feature/habitat-builder` of `Blackwaterleaf/blackwaterleaf` into the main BlackWaterLeaf application. This is an update to the existing app—not a separate website and not a standalone prototype.

Start by reading `docs/habitat-builder-photorealistic-spec.md` in that branch. Treat it as binding acceptance criteria. The earlier low-poly/configurator prototype must not be copied into the app. Build a production-grade route at `/aquariums/builder`, wrapped in the existing `AppLayout`, and add a visible “3D planen” entry point on `/aquariums`.

Use only photorealistic, licensed PBR GLB/GLTF habitat assets. No primitive spheres, cones, dodecahedra, low-poly fish or toy-like placeholder geometry may appear in the customer scene. Source assets must be 4K PBR where relevant; use KTX2/BasisU or appropriate compressed runtime textures and a device-adaptive renderer. An 8K live canvas is not required or desirable; retain 8K only as an optional offline/hero source where supplied.

The initial implementation must not alter server routes, database schemas, auth, payments, or partner products. Reuse `/marketplace` for the transparent handoff and do not display made-up prices or availability. Include robust scene loading, error and no-WebGL fallback states.

Before deploy, run `pnpm run check`, `pnpm run test`, and `pnpm run build`. Report the file diff, real asset licences/sources, validation output, and deployment URL.
```

## What the deployment chat needs

The branch contains the Three.js dependencies and the full implementation brief, but it intentionally does **not** contain the earlier stylized scene. A production-grade photorealistic builder must start with real, licensed PBR plant, hardscape and glass assets. This prevents the toy-like visual quality of the first prototype from entering the live application.
