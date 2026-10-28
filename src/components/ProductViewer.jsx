import { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Text } from '@react-three/drei'
import { MathUtils, MeshStandardMaterial } from 'three'
import { formatPrice } from '../hooks/useCartStore'

// Category path mapping for textures
const CATEGORY_PATHS = {
  clothing: 'garments',
  shoes: 'shoes',
  bags: 'bags',
  caps: 'caps',
}

export default function ProductViewer({ 
  product, 
  category, 
  views,
  position, 
  rotation,
  sectionRotationY,
  isSelected, 
  isHovered, 
  onSelect, 
  onHover, 
  onHoverEnd,
}) {
  const groupRef = useRef()
  const [activeView, setActiveView] = useState(0)
  
  const categoryPath = CATEGORY_PATHS[category]
  
  // Load the front texture (or active view texture)
  const activeViewData = views[activeView]
  const texturePath = `/${categoryPath}/${product.id}/${activeViewData.file}.webp?v=6`
  const texture = useTexture(texturePath)
  
  // Auto-rotate when selected
  useFrame((state, delta) => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += delta * 0.3
    } else if (groupRef.current && isHovered) {
      groupRef.current.rotation.y += delta * 0.1
    }
  })
  
  // Build the 3D representation based on product type
  const geometry = useMemo(() => {
    switch (category) {
      case 'clothing':
        return <planeGeometry args={[1, 1.2]} />
      case 'shoes':
        return <boxGeometry args={[0.5, 0.3, 1]} />
      case 'bags':
        return <boxGeometry args={[0.8, 1.2, 0.4]} />
      case 'caps':
        return <coneGeometry args={[0.4, 0.15, 8]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [category])
  
  // Handle click to select
  const handleClick = (e) => {
    e.stopPropagation()
    onSelect()
  }
  
  // Scale for hover effect
  const scale = isHovered ? 1.1 : 1
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); onHover() }}
      onPointerOut={(e) => { e.stopPropagation(); onHoverEnd() }}
    >
      {/* Product mesh */}
      <mesh castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial map={texture} transparent />
      </mesh>
      
      {/* Product label - counter-rotate to always face camera */}
      <Text
        position={[0, -0.6, 0]}
        rotation-y={-(sectionRotationY || 0)}
        fontSize={0.12}
        color="#111"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>
      
      <Text
        position={[0, -0.75, 0]}
        rotation-y={-(sectionRotationY || 0)}
        fontSize={0.1}
        color="#5f5d58"
        anchorX="center"
        anchorY="middle"
      >
        {formatPrice(product.price)}
      </Text>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.7, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshStandardMaterial color="#111" emissive="#111" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}
