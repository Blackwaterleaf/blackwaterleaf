import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { BuilderDimensions, BuilderHabitatKind } from "@/lib/habitatBuilder";

type HabitatCanvasProps = {
  habitat: BuilderHabitatKind;
  dimensions: BuilderDimensions;
  referenceImage: string;
};

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

  return (
    <group position={[0, 0.12, -2.12]}>
      <mesh>
        <planeGeometry args={[8.7, 4.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[8.76, 4.96]} />
        <meshBasicMaterial color="#001d13" opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

function GlassEnclosure({ habitat, dimensions }: Pick<HabitatCanvasProps, "habitat" | "dimensions">) {
  const ratio = useMemo(() => {
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
  }, [dimensions]);

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

  return (
    <group position={[0, -0.04, 0.18]}>
      <mesh position={[0, -ratio.height / 2 - 0.04, 0]} receiveShadow>
        <boxGeometry args={[ratio.width, 0.08, ratio.depth]} />
        <meshPhongMaterial color="#07120d" specular="#41685a" shininess={24} />
      </mesh>
      {edges.map((edge, index) => (
        <mesh key={index} position={[edge[0], edge[1], edge[2]]}>
          <boxGeometry args={[edge[3], edge[4], edge[5]]} />
          <meshPhongMaterial color={glass} specular="#e8ffff" shininess={84} opacity={0.74} transparent />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[ratio.width - 0.06, ratio.height - 0.06, ratio.depth - 0.06]} />
        <meshPhongMaterial color={glass} specular="#e8ffff" shininess={96} opacity={0.1} transparent side={THREE.BackSide} />
      </mesh>
      {habitat === "aquarium" ? <mesh position={[0, ratio.height * 0.05, 0]}>
        <boxGeometry args={[ratio.width - 0.14, ratio.height * 0.82, ratio.depth - 0.14]} />
        <meshPhongMaterial color="#357d70" specular="#a7ffef" shininess={72} opacity={0.08} transparent />
      </mesh> : null}
      <mesh position={[0, -ratio.height * 0.42, 0]} receiveShadow>
        <boxGeometry args={[ratio.width - 0.14, habitat === "aquarium" ? 0.22 : 0.42, ratio.depth - 0.14]} />
        <meshLambertMaterial color={habitat === "aquarium" ? "#6b4e30" : "#271d16"} />
      </mesh>
    </group>
  );
}

function Scene(props: HabitatCanvasProps) {
  return <>
    <ambientLight intensity={1.45} color={props.habitat === "aquarium" ? "#b4f9ed" : "#dbf6d2"} />
    <directionalLight position={[5, 6, 4]} intensity={2.25} color="#f5e8c8" />
    <pointLight position={[-4, 2, 2]} intensity={1.1} color={props.habitat === "aquarium" ? "#35d7ff" : "#d9cf66"} />
    <Suspense fallback={null}><ReferenceBackdrop image={props.referenceImage} /></Suspense>
    <GlassEnclosure habitat={props.habitat} dimensions={props.dimensions} />
    <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} minDistance={5.9} maxDistance={10.1} minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.61} minAzimuthAngle={-0.3} maxAzimuthAngle={0.3} target={[0, 0, 0]} />
    <ViewSettings />
  </>;
}

export function HabitatCanvas(props: HabitatCanvasProps) {
  return <Canvas className="habitat-canvas" dpr={[1, 1.5]} camera={{ position: [6.6, 3.2, 7.35], fov: 35 }} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} fallback={<div className="habitat-canvas-fallback">Interaktive Glasansicht nicht verfügbar – die Referenzansicht bleibt sichtbar.</div>}>
    <Scene {...props} />
  </Canvas>;
}
