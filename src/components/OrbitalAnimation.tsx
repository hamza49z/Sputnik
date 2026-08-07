import React, { useEffect, useRef } from 'react';

export const OrbitalAnimation: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Load Three.js dynamically if not present
    const initThree = () => {
      const THREE = (window as unknown as { THREE: any }).THREE;
      if (!THREE) return;

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Clear previous canvas if any
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Central Pool Core
      const coreGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const coreMaterial = new THREE.MeshPhongMaterial({
        color: 0x0047ab,
        emissive: 0x002d72,
        emissiveIntensity: 0.6,
        shininess: 90,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(core);

      // Satellites and Rings
      const satellites: Array<{ mesh: any; radius: number; speed: number; angle: number }> = [];

      const createOrbit = (radius: number, speed: number, colorHex: number, size: number) => {
        const orbit = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 64);
        const orbitMat = new THREE.MeshBasicMaterial({
          color: 0xc3c6d5,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(orbit, orbitMat);
        ring.rotation.x = Math.PI / 2.3;
        group.add(ring);

        const satGeom = new THREE.SphereGeometry(size, 20, 20);
        const satMat = new THREE.MeshPhongMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.3,
        });
        const sat = new THREE.Mesh(satGeom, satMat);
        satellites.push({ mesh: sat, radius, speed, angle: Math.random() * Math.PI * 2 });
        group.add(sat);
      };

      createOrbit(2.2, 0.012, 0x82c8e5, 0.22); // Sky Blue
      createOrbit(3.2, 0.008, 0x00327d, 0.28); // Deep Cobalt
      createOrbit(4.2, 0.005, 0x4b53bc, 0.2);  // Purple-blue secondary

      // Lighting
      const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);

      const ambientLight = new THREE.AmbientLight(0xd0e5fc, 0.8);
      scene.add(ambientLight);

      camera.position.z = 7.5;
      camera.position.y = 1.2;

      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        group.rotation.y += 0.003;
        group.rotation.x += 0.001;

        satellites.forEach((s) => {
          s.angle += s.speed;
          s.mesh.position.x = Math.cos(s.angle) * s.radius;
          s.mesh.position.z = Math.sin(s.angle) * s.radius;
          s.mesh.position.y = Math.sin(s.angle * 2) * 0.3;
        });

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 400;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    if ((window as unknown as { THREE: any }).THREE) {
      initThree();
    } else {
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js';
      script.onload = () => initThree();
      document.head.appendChild(script);
    }
  }, []);

  return <div ref={containerRef} className={`relative overflow-hidden rounded-2xl ${className}`} />;
};
