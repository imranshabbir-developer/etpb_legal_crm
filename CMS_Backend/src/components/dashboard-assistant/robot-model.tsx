import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type RobotModelProps = {
  chatting?: boolean;
};

export function RobotModel({ chatting = false }: RobotModelProps) {
  const group = useRef<Group>(null);
  const antenna = useRef<Group>(null);
  const leftEye = useRef<Group>(null);
  const rightEye = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.6) * 0.04;
      group.current.rotation.y = Math.sin(t * 0.7) * 0.12;
    }
    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 3) * 0.08;
    }
    const blink = Math.sin(t * 4) > 0.92 ? 0.15 : 1;
    if (leftEye.current) leftEye.current.scale.y = blink;
    if (rightEye.current) rightEye.current.scale.y = blink;
  });

  const eyeGlow = chatting ? "#5dffb0" : "#2dd47a";
  const bodyColor = "#003818";
  const dark = "#001a0c";

  return (
    <group ref={group} scale={0.95}>
      {/* Antenna */}
      <group ref={antenna} position={[0, 0.72, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color={dark} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={eyeGlow}
            emissive={eyeGlow}
            emissiveIntensity={chatting ? 2.2 : 1.2}
          />
        </mesh>
      </group>

      {/* Head */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.62, 0.48, 0.5]} />
        <meshStandardMaterial color="#e8f5ec" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.42, 0.26]}>
        <boxGeometry args={[0.58, 0.44, 0.04]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Eyes */}
      <group ref={leftEye} position={[-0.14, 0.45, 0.28]}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={1.6} />
        </mesh>
      </group>
      <group ref={rightEye} position={[0.14, 0.45, 0.28]}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={eyeGlow} emissive={eyeGlow} emissiveIntensity={1.6} />
        </mesh>
      </group>

      {/* Body */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.56, 0.52, 0.42]} />
        <meshStandardMaterial color={bodyColor} metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.02, 0.22]}>
        <boxGeometry args={[0.22, 0.14, 0.04]} />
        <meshStandardMaterial color={dark} emissive="#2dd47a" emissiveIntensity={chatting ? 0.8 : 0.35} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.38, 0.02, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.14, 0.36, 0.14]} />
        <meshStandardMaterial color={dark} metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0.38, 0.02, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.14, 0.36, 0.14]} />
        <meshStandardMaterial color={dark} metalness={0.4} roughness={0.45} />
      </mesh>

      {/* Base */}
      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.12, 20]} />
        <meshStandardMaterial color={dark} metalness={0.65} roughness={0.25} />
      </mesh>
    </group>
  );
}
