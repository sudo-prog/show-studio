import { useMemo, useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useGLTF, useTexture, Text } from '@react-three/drei'
import { Group, MathUtils, Vector3 } from 'three'
import ProductViewer from './ProductViewer'

// Category path mapping
const CATEGORY_PATHS = {
  clothing: 'garments',
  shoes: 'shoes',
  bags: 'bags',
  caps: 'caps',
}

// View configurations per product type
const SECTION_VIEWS = {
  default: [
    { label: 'Front', file: 'front', angle: 0 },
    { label: 'Side', file: 'side', angle: MathUtils.degToRad(90) },
    { label: 'Back', file: 'back', angle: MathUtils.degToRad(180) },
    { label: 'Other side', file: 'side', angle: MathUtils.degToRad(-90), mirror: true },
  ],
  shoes: [
    { label: 'Side', file: 'right', angle: 0 },
    { label: 'Front', file: 'front', angle: MathUtils.degToRad(-90) },
    { label: 'Other side', file: 'left', angle: MathUtils.degToRad(180) },
    { label: 'Back', file: 'back', angle: MathUtils.degToRad(90) },
  ],
}

export default function ShopSection({ 
  category, 
  section, 
  productList, 
  selectedProduct, 
  hoveredProduct, 
  onSelect,
  onHover,
  onHoverEnd,
}) {
  const groupRef = useRef()
  
  // Position the entire section
  const origin = section.origin
  const rotationY = section.rotationY || 0
  
  // Compute product positions within the section
  const productPositions = useMemo(() => {
    const count = productList.length
    const spacing = section.fitWidth / (count + 1)
    const isVertical = category === 'clothing' || category === 'bags'
    
    return productList.map((product, i) => {
      const t = (i + 1) / (count + 1)
      if (isVertical) {
        // Vertical stack (clothing rack, bags)
        return {
          position: [0, -(t * section.fitHeight || 3) + (section.fitHeight || 3) / 2, (t - 0.5) * section.fitWidth],
          rotation: [0, 0, 0],
        }
      } else {
        // Horizontal arrangement (shoes wall, caps)
        return {
          position: [(t - 0.5) * (section.fitWidth || 3), 0, 0],
          rotation: [0, 0, 0],
        }
      }
    })
  }, [productList, category, section])

  return (
    <group ref={groupRef} position={origin} rotation-y={rotationY}>
      {/* Section label - counter-rotate so it faces the camera */}
      <Text
        position={[0, section.fitHeight ? section.fitHeight / 2 + 0.5 : 2.5, 0]}
        rotation-y={-rotationY}
        fontSize={0.3}
        color="#111"
        anchorX="center"
        anchorY="middle"
      >
        {section.label}
      </Text>
      
      {/* Products */}
      {productList.map((product, i) => (
        <ProductViewer
          key={product.id}
          product={product}
          category={category}
          views={category === 'shoes' ? SECTION_VIEWS.shoes : SECTION_VIEWS.default}
          position={productPositions[i].position}
          rotation={productPositions[i].rotation}
          sectionRotationY={rotationY}
          isSelected={selectedProduct?.id === product.id}
          isHovered={hoveredProduct?.id === product.id}
          onSelect={() => onSelect(product)}
          onHover={() => onHover(product)}
          onHoverEnd={() => onHover(null)}
        />
      ))}
    </group>
  )
}
