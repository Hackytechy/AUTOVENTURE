import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Float, Stars, Octahedron, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function HolographicCore() {
  const coreRef = useRef();
  const shellRef = useRef();
  const scannerRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
        coreRef.current.rotation.y = time * 0.4;
        coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (shellRef.current) {
        shellRef.current.rotation.y = -time * 0.2;
        shellRef.current.rotation.x = time * 0.1;
    }
    if (scannerRef.current) {
        scannerRef.current.rotation.z = time * 0.8;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
        <group>
            {/* 1. INNER GLOW CORE */}
            <mesh ref={coreRef}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshBasicMaterial color={hovered ? '#ec4899' : '#6366f1'} toneMapped={false} />
            </mesh>

            {/* 2. TRANSLUCENT GLASS SHELL */}
            <mesh ref={shellRef}>
                <octahedronGeometry args={[1.1, 0]} />
                <MeshWobbleMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={0.15} 
                  roughness={0} 
                  metalness={1} 
                  factor={0.1} 
                  speed={2} 
                />
            </mesh>

            {/* 3. ROTATING WIREFRAME SCANNER */}
            <mesh ref={scannerRef}>
                <octahedronGeometry args={[1.4, 0]} />
                <meshBasicMaterial color="#6366f1" wireframe opacity={0.1} transparent />
            </mesh>

            {/* 4. POINT LIGHT INSIDE CORE */}
            <pointLight intensity={2} color={hovered ? '#ec4899' : '#6366f1'} />
        </group>
    </Float>
  );
}

const Hero3D = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      opacity: 0.9,
      pointerEvents: 'none'
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#f8fafc']} />
        <fog attach="fog" args={['#f8fafc', 3, 10]} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <HolographicCore />
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
