import React, { useLayoutEffect, forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A wrapper component for preloaded GLTF models.
 * It applies necessary properties for lighting and shadows.
 * @param {object} props - Component props.
 * @param {string} props.url - The path to the GLB model.
 */
export const ModelWrapper = forwardRef(({ url, ...props }, ref) => {
  // useGLTF will automatically use the preloaded model from the cache
  const { scene } = useGLTF(url);

  // useLayoutEffect is used to ensure these changes are applied synchronously
  // before the model is first rendered to the screen.
  useLayoutEffect(() => {
    if (scene) {
      // --- LIGHTING FIX ---
      // Traverse the model's scene graph
      scene.traverse((child) => {
        // Check if the child is a mesh
        if (child.isMesh) {
          // Enable casting and receiving shadows for each mesh
          child.castShadow = true;
          child.receiveShadow = true;

          // Ensure the material is updated to reflect lighting changes
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);

  // Render the model's scene graph.
  // Any additional props like scale, position, rotation are passed here.
  return <primitive object={scene} ref={ref} {...props} />;
});
