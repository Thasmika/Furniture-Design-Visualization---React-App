import type { Room } from '../models/Room';

interface RoomMeshProps {
  room: Room;
}

export function RoomMesh({ room }: RoomMeshProps) {
  const { shape, dimensions, colorScheme } = room;

  // Calculate room dimensions
  const width = shape === 'circular' ? dimensions.radius * 2 : dimensions.width;
  const length = shape === 'circular' ? dimensions.radius * 2 : dimensions.length;
  const wallHeight = 8; // Standard wall height in feet

  return (
    <group>
      {/* Floor */}
      {shape === 'circular' ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[dimensions.radius, 32]} />
          <meshStandardMaterial color={colorScheme.floor} />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial color={colorScheme.floor} />
        </mesh>
      )}

      {/* Ceiling */}
      {shape === 'circular' ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
          <circleGeometry args={[dimensions.radius, 32]} />
          <meshStandardMaterial color={colorScheme.ceiling} />
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial color={colorScheme.ceiling} />
        </mesh>
      )}

      {/* Walls */}
      {shape === 'circular' ? (
        // Circular wall
        <mesh position={[0, wallHeight / 2, 0]}>
          <cylinderGeometry args={[dimensions.radius, dimensions.radius, wallHeight, 32, 1, true]} />
          <meshStandardMaterial color={colorScheme.walls} side={2} />
        </mesh>
      ) : (
        // Rectangular walls
        <>
          {/* Front wall (positive Z) */}
          <mesh position={[0, wallHeight / 2, length / 2]}>
            <boxGeometry args={[width, wallHeight, 0.2]} />
            <meshStandardMaterial color={colorScheme.walls} />
          </mesh>

          {/* Back wall (negative Z) */}
          <mesh position={[0, wallHeight / 2, -length / 2]}>
            <boxGeometry args={[width, wallHeight, 0.2]} />
            <meshStandardMaterial color={colorScheme.walls} />
          </mesh>

          {/* Left wall (negative X) */}
          <mesh position={[-width / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.2, wallHeight, length]} />
            <meshStandardMaterial color={colorScheme.walls} />
          </mesh>

          {/* Right wall (positive X) */}
          <mesh position={[width / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.2, wallHeight, length]} />
            <meshStandardMaterial color={colorScheme.walls} />
          </mesh>
        </>
      )}
    </group>
  );
}
