import { Canvas } from "@react-three/fiber";

import { RobotModel } from "@/components/dashboard-assistant/robot-model";

type RobotCanvasProps = {
  chatting?: boolean;
};

export function RobotCanvas({ chatting = false }: RobotCanvasProps) {
  return (
    <Canvas
      className="assistant-robot-canvas"
      camera={{ position: [0, 0.15, 2.15], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 4, 3]} intensity={1.15} color="#ffffff" />
      <pointLight position={[-1.5, 1, 2]} intensity={0.9} color="#2dd47a" />
      <pointLight position={[1.5, 0.5, 1]} intensity={0.5} color="#003818" />
      <RobotModel chatting={chatting} />
    </Canvas>
  );
}
