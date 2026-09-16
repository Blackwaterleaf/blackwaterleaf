import { Canvas, type ThreeEvent, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import { normalizeBuilderPlacement, type BuilderDimensions, type BuilderHabitatKind, type BuilderPlacement } from "@/lib/habitatBuilder";

type HabitatCanvasProps = {
  habitat: BuilderHabitatKind;
  dimensions: BuilderDimensions;
  referenceImage: string;
  placements: BuilderPlacement[];
  selectedPlacementId: string | null;
  placementTool: BuilderPlacement["type"] | null;
  onPlace: (xPct: number, zPct: number) => void;
  onSelect: (id: string | null) => void;
};

type EnclosureRatio = { width: number; depth: number; height: number };

function enclosureRatio(dimensions: BuilderDimensions): EnclosureRatio {
  const length = dimensions.lengthCm ?? 120;
  const width = dimensions.widthCm ?? 50;
  const height = dimensions.heightCm ?? 50;
  const longest = Math.max(length, width, height);
  const scale = Math.min(1.08, Math.max(0.64, 128 / longest));
  return {
    width: Math.max(4.6, length / 22) * scale,
    depth: Math.max(2.2, width / 22) * scale,
    height: Math.max(2.8, height / 19) * scale,
  };
}

function ViewSettings() {
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    scene.background = new THREE.Color("#020806");
  }, [gl, scene]);

  return null;
}

function ReferenceBackdrop({ image }: { image: string }) {
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;

  return <group position={[0, 0.12, -2.12]}>
    <mesh><planeGeometry args={[8.7, 4.9]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    <mesh position={[0, 0, 0.01]}><planeGeometry args={[8.76, 4.96]} /><meshBasicMaterial color="#001d13" opacity={0.2} transparent /></mesh>
  </group>;
}

function GlassEnclosure({ habitat, ratio }: { habitat: BuilderHabitatKind; ratio: EnclosureRatio }) {
  const edges = useMemo(() => {
    const x = ratio.width / 2;
    const y = ratio.height / 2;
    const z = ratio.depth / 2;
    return [
      [-x, -y, -z, ratio.width, 0.04, 0.04], [x, -y, -z, ratio.width, 0.04, 0.04],
      [-x, y, -z, ratio.width, 0.04, 0.04], [x, y, -z, ratio.width, 0.04, 0.04],
      [-x, -y, z, ratio.width, 0.04, 0.04], [x, -y, z, ratio.width, 0.04, 0.04],
      [-x, y, z, ratio.width, 0.04, 0.04], [x, y, z, ratio.width, 0.04, 0.04],
      [-x, 0, -z, 0.04, ratio.height, 0.04], [x, 0, -z, 0.04, ratio.height, 0.04],
      [-x, 0, z, 0.04, ratio.height, 0.04], [x, 0, z, 0.04, ratio.height, 0.04],
    ] as Array<[number, number, number, number, number, number]>;
  }, [ratio]);
  const glass = habitat === "aquarium" ? "#8fc8bc" : "#b9d0af";

  return <group position={[0, -0.04, 0.18]}>
    <mesh position={[0, -ratio.height / 2 - 0.04, 0]} receiveShadow><boxGeometry args={[ratio.width, 0.08, ratio.depth]} /><meshPhongMaterial color="#07120d" specular="#41685a" shininess={24} /></mesh>
    {edges.map((edge, index) => <mesh key={index} position={[edge[0], edge[1], edge[2]]}><boxGeometry args={[edge[3], edge[4], edge[5]]} /><meshPhongMaterial color={glass} specular="#e8ffff" shininess={84} opacity={0.74} transparent /></mesh>)}
    <mesh><boxGeometry args={[ratio.width - 0.06, ratio.height - 0.06, ratio.depth - 0.06]} /><meshPhongMaterial color={glass} specular="#e8ffff" shininess={96} opacity={0.1} transparent side={THREE.BackSide} /></mesh>
    {habitat === "aquarium" ? <mesh position={[0, ratio.height * 0.05, 0]}><boxGeometry args={[ratio.width - 0.14, ratio.height * 0.82, ratio.depth - 0.14]} /><meshPhongMaterial color="#357d70" specular="#a7ffef" shininess={72} opacity={0.08} transparent /></mesh> : null}
    <mesh position={[0, -ratio.height * 0.42, 0]} receiveShadow><boxGeometry args={[ratio.width - 0.14, habitat === "aquarium" ? 0.22 : 0.42, ratio.depth - 0.14]} /><meshLambertMaterial color={habitat === "aquarium" ? "#6b4e30" : "#271d16"} /></mesh>
  </group>;
}

function PlacementShape({ placement, ratio, selected, onSelect }: { placement: BuilderPlacement; ratio: EnclosureRatio; selected: boolean; onSelect: (id: string) => void }) {
  const item = normalizeBuilderPlacement(placement);
  const x = item.xPct / 100 * ratio.width * 0.42;
  const z = item.zPct / 100 * ratio.depth * 0.42;
  const floor = -ratio.height * 0.37;
  const rotation = item.rotationDeg * Math.PI / 180;
  const outline = selected ? "#fff3a3" : "#75efff";
  const select = (event: ThreeEvent<MouseEvent>) => { event.stopPropagation(); onSelect(item.id); };

  if (item.type === "hardscape" || item.type === "structure") return <group position={[x, floor + 0.35 * item.scale, z]} rotation={[0, rotation, 0]} scale={item.scale} onClick={select}>
    <mesh castShadow><dodecahedronGeometry args={[0.46, 0]} /><meshLambertMaterial color={item.type === "hardscape" ? "#765035" : "#67492e"} /></mesh>
    {selected ? <mesh scale={1.25}><dodecahedronGeometry args={[0.46, 0]} /><meshBasicMaterial color={outline} wireframe /></mesh> : null}
  </group>;

  if (item.type === "plants") return <group position={[x, floor + 0.15 * item.scale, z]} rotation={[0, rotation, 0]} scale={item.scale} onClick={select}>
    {[-0.16, 0, 0.16].map((offset, index) => <mesh key={offset} position={[offset, .22 + index * .06, index === 1 ? .05 : -.05]} rotation={[0, index * .5, index % 2 ? .12 : -.12]}><coneGeometry args={[.1, .68, 5]} /><meshLambertMaterial color={index === 1 ? "#8fce66" : "#4c9d55"} /></mesh>)}
    {selected ? <mesh position={[0, .27, 0]}><boxGeometry args={[.62, .78, .5]} /><meshBasicMaterial color={outline} wireframe /></mesh> : null}
  </group>;

  if (item.type === "filter" || item.type === "climate") return <group position={[x, floor + .24 * item.scale, z]} rotation={[0, rotation, 0]} scale={item.scale} onClick={select}>
    <mesh><boxGeometry args={[.42, .48, .32]} /><meshPhongMaterial color={item.type === "filter" ? "#2e7580" : "#907b3c"} specular="#d7fff1" shininess={42} /></mesh>
    <mesh position={[0, .28, 0]}><cylinderGeometry args={[.055, .055, .16, 12]} /><meshLambertMaterial color="#b9eff2" /></mesh>
    {selected ? <mesh><boxGeometry args={[.52, .58, .42]} /><meshBasicMaterial color={outline} wireframe /></mesh> : null}
  </group>;

  return <group position={[x, floor + .06, z]} rotation={[0, rotation, 0]} scale={item.scale} onClick={select}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.42, 20]} /><meshLambertMaterial color={item.type === "leaf-litter" ? "#a06835" : "#4b3326"} opacity={.9} transparent /></mesh>
    {selected ? <mesh position={[0, .02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.43, .5, 24]} /><meshBasicMaterial color={outline} /></mesh> : null}
  </group>;
}

function EditableFloor({ ratio, active, onPlace, onClear }: { ratio: EnclosureRatio; active: boolean; onPlace: (xPct: number, zPct: number) => void; onClear: () => void }) {
  const handleFloorClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!active) { onClear(); return; }
    onPlace(event.point.x / (ratio.width * .42) * 100, event.point.z / (ratio.depth * .42) * 100);
  };
  return <mesh position={[0, -ratio.height * .36, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={handleFloorClick}>
    <planeGeometry args={[ratio.width - .18, ratio.depth - .18]} />
    <meshBasicMaterial color={active ? "#6feaff" : "#0a1d13"} opacity={active ? .18 : .01} transparent depthWrite={false} />
  </mesh>;
}

function Scene(props: HabitatCanvasProps) {
  const ratio = useMemo(() => enclosureRatio(props.dimensions), [props.dimensions]);
  return <>
    <ambientLight intensity={1.45} color={props.habitat === "aquarium" ? "#b4f9ed" : "#dbf6d2"} />
    <directionalLight position={[5, 6, 4]} intensity={2.25} color="#f5e8c8" />
    <pointLight position={[-4, 2, 2]} intensity={1.1} color={props.habitat === "aquarium" ? "#35d7ff" : "#d9cf66"} />
    <Suspense fallback={null}><ReferenceBackdrop image={props.referenceImage} /></Suspense>
    <GlassEnclosure habitat={props.habitat} ratio={ratio} />
    <EditableFloor ratio={ratio} active={Boolean(props.placementTool)} onPlace={props.onPlace} onClear={() => props.onSelect(null)} />
    {props.placements.map(placement => <PlacementShape key={placement.id} placement={placement} ratio={ratio} selected={props.selectedPlacementId === placement.id} onSelect={props.onSelect} />)}
    <OrbitControls enablePan={false} enableRotate={!props.placementTool} enableDamping dampingFactor={0.08} minDistance={5.9} maxDistance={10.1} minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.61} minAzimuthAngle={-0.3} maxAzimuthAngle={0.3} target={[0, 0, 0]} />
    <ViewSettings />
  </>;
}

export function HabitatCanvas(props: HabitatCanvasProps) {
  return <Canvas className={`habitat-canvas ${props.placementTool ? "habitat-canvas--placing" : ""}`} dpr={[1, 1.5]} camera={{ position: [6.6, 3.2, 7.35], fov: 35 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} fallback={<div className="habitat-canvas-fallback">Interaktive Glasansicht nicht verfügbar – die Referenzansicht bleibt sichtbar.</div>}>
    <Scene {...props} />
  </Canvas>;
}
