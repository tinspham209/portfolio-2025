import * as THREE from "three";
import { useRef, useMemo, useState, useEffect, FC } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
	BallCollider,
	Physics,
	RigidBody,
	CylinderCollider,
	RapierRigidBody,
} from "@react-three/rapier";

// Constants
const SPHERE_COUNT = 30;
const TECH_IMAGES = [
	"/images/react2.webp",
	"/images/next2.webp",
	"/images/typescript.webp",
	"/images/javascript.webp",
];

// Utility functions
const loadTextures = () => {
	const textureLoader = new THREE.TextureLoader();
	return TECH_IMAGES.map((url) => textureLoader.load(url));
};

const createSpheres = (count: number) => {
	const scales = [0.7, 1, 0.8, 1, 1];
	return [...Array(count)].map(() => ({
		scale: scales[Math.floor(Math.random() * scales.length)],
	}));
};

// Shared geometries
const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);
const spheres = createSpheres(SPHERE_COUNT);

// Types
interface SphereProps {
	vec?: THREE.Vector3;
	scale: number;
	r?: typeof THREE.MathUtils.randFloatSpread;
	material: THREE.MeshPhysicalMaterial;
	isActive: boolean;
}

interface PointerProps {
	vec?: THREE.Vector3;
	isActive: boolean;
}

// Components
const SphereGeo: FC<SphereProps> = ({
	vec = new THREE.Vector3(),
	scale,
	r = THREE.MathUtils.randFloatSpread,
	material,
	isActive,
}) => {
	const api = useRef<RapierRigidBody | null>(null);

	useFrame((_state, delta) => {
		if (!isActive || !api.current) return;

		const clampedDelta = Math.min(0.1, delta);
		const impulse = vec
			.copy(api.current.translation())
			.normalize()
			.multiply(
				new THREE.Vector3(
					-50 * clampedDelta * scale,
					-150 * clampedDelta * scale,
					-50 * clampedDelta * scale
				)
			);

		api.current.applyImpulse(impulse, true);
	});

	return (
		<RigidBody
			linearDamping={0.75}
			angularDamping={0.15}
			friction={0.2}
			position={[r(20), r(20) - 25, r(20) - 10]}
			ref={api}
			colliders={false}
		>
			<BallCollider args={[scale]} />
			<CylinderCollider
				rotation={[Math.PI / 2, 0, 0]}
				position={[0, 0, 1.2 * scale]}
				args={[0.15 * scale, 0.275 * scale]}
			/>
			<mesh
				castShadow
				receiveShadow
				scale={scale}
				geometry={sphereGeometry}
				material={material}
				rotation={[0.3, 1, 1]}
			/>
		</RigidBody>
	);
};

const Pointer: FC<PointerProps> = ({ vec = new THREE.Vector3(), isActive }) => {
	const ref = useRef<RapierRigidBody>(null);

	useFrame(({ pointer, viewport }) => {
		if (!isActive || !ref.current) return;

		const targetVec = vec.lerp(
			new THREE.Vector3(
				(pointer.x * viewport.width) / 2,
				(pointer.y * viewport.height) / 2,
				0
			),
			0.2
		);
		ref.current.setNextKinematicTranslation(targetVec);
	});

	return (
		<RigidBody
			position={[100, 100, 100]}
			type="kinematicPosition"
			colliders={false}
			ref={ref}
		>
			<BallCollider args={[2]} />
		</RigidBody>
	);
};

// Scene component
const TechScene: FC<{ isActive: boolean }> = ({ isActive }) => {
	const textures = useMemo(() => loadTextures(), []);

	const materials = useMemo(() => {
		return textures.map(
			(texture) =>
				new THREE.MeshPhysicalMaterial({
					map: texture,
					emissive: "#ffffff",
					emissiveMap: texture,
					emissiveIntensity: 0.3,
					metalness: 0.5,
					roughness: 1,
					clearcoat: 0.1,
				})
		);
	}, [textures]);

	const getRandomMaterial = () => {
		return materials[Math.floor(Math.random() * materials.length)];
	};

	return (
		<>
			<ambientLight intensity={1} />
			<spotLight
				position={[20, 20, 25]}
				penumbra={1}
				angle={0.2}
				color="white"
				castShadow
				shadow-mapSize={[512, 512]}
			/>
			<directionalLight position={[0, 5, -4]} intensity={2} />
			<Physics gravity={[0, 0, 0]}>
				<Pointer isActive={isActive} />
				{spheres.map((props, i) => (
					<SphereGeo
						key={i}
						{...props}
						material={getRandomMaterial()}
						isActive={isActive}
					/>
				))}
			</Physics>
			<Environment
				files="/models/char_enviorment.hdr"
				environmentIntensity={0.5}
				environmentRotation={[0, 4, 2]}
			/>
			<EffectComposer enableNormalPass={false}>
				<N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
			</EffectComposer>
		</>
	);
};

const TechStack: FC = () => {
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY || document.documentElement.scrollTop;
			const workElement = document.getElementById("work");

			if (workElement) {
				const threshold = workElement.getBoundingClientRect().top;
				setIsActive(scrollY > threshold);
			}
		};

		// Add click event listeners to navigation links
		const clickHandlers: { [key: string]: () => void } = {};
		const navLinks = document.querySelectorAll(".header a");

		navLinks.forEach((elem, index) => {
			const element = elem as HTMLAnchorElement;
			const handler = () => {
				const interval = setInterval(handleScroll, 10);
				setTimeout(() => clearInterval(interval), 1000);
			};

			clickHandlers[`link-${index}`] = handler;
			element.addEventListener("click", handler);
		});

		// Add scroll event listener
		window.addEventListener("scroll", handleScroll);

		// Initial check
		handleScroll();

		// Cleanup function
		return () => {
			window.removeEventListener("scroll", handleScroll);

			navLinks.forEach((elem, index) => {
				const element = elem as HTMLAnchorElement;
				const handler = clickHandlers[`link-${index}`];
				if (handler) {
					element.removeEventListener("click", handler);
				}
			});
		};
	}, []);

	return (
		<div className="techstack">
			<h2>My Techstack</h2>

			<Canvas
				shadows
				gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
				camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
				onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
				className="tech-canvas"
			>
				<TechScene isActive={isActive} />
			</Canvas>
		</div>
	);
};

export default TechStack;
