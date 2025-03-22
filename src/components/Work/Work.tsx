import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FC, useRef } from "react";
import "./Work.css";
import { Project, projects } from "./Work.helpers";
import WorkImage from "./WorkImage";

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Project card component
const ProjectCard: FC<{ project: Project; index: number }> = ({
	project,
	index,
}) => {
	const { title, category, tools, image } = project;
	const currentIndex = index + 1;

	return (
		<div className="work-box">
			<div className="work-info">
				<div className="work-title">
					<h3>{title}</h3>
					<div>
						<h4>
							{currentIndex < 10 ? `0${currentIndex}` : `${currentIndex}`}
						</h4>
						<p>{category}</p>
					</div>
				</div>
				<h4>Tools and features</h4>
				<p>{tools.join(", ")}</p>
			</div>
			<WorkImage image={image} alt={title} />
		</div>
	);
};

const Work: FC = () => {
	const workSectionRef = useRef<HTMLDivElement>(null);
	const workFlexRef = useRef<HTMLDivElement>(null);

	// Calculate horizontal scroll distance
	const calculateTranslateX = (): number => {
		if (!workFlexRef.current) return 0;

		const boxes = document.getElementsByClassName("work-box");
		if (!boxes.length) return 0;

		const containerRect = document
			.querySelector(".work-container")
			?.getBoundingClientRect();
		if (!containerRect) return 0;

		const boxRect = boxes[0].getBoundingClientRect();
		const parentWidth =
			boxes[0].parentElement?.getBoundingClientRect().width || 0;
		const padding = parseInt(window.getComputedStyle(boxes[0]).padding) / 2;

		return (
			boxRect.width * boxes.length -
			(containerRect.left + parentWidth) +
			padding
		);
	};

	// Set up GSAP animation
	useGSAP(() => {
		const translateX = calculateTranslateX();

		const timeline = gsap.timeline({
			scrollTrigger: {
				trigger: ".work-section",
				start: "top top",
				end: "bottom top",
				scrub: true,
				pin: true,
				pinType: !ScrollTrigger.isTouch ? "transform" : "fixed",
				id: "work",
			},
		});

		timeline.to(".work-flex", {
			x: -translateX,
			duration: 40,
			delay: 0.2,
		});

		// Handle window resize
		const handleResize = () => {
			ScrollTrigger.refresh();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className="work-section" id="work" ref={workSectionRef}>
			<div className="work-container section-container">
				<h2>
					My <span>Work</span>
				</h2>
				<div className="work-flex" ref={workFlexRef}>
					{projects.map((project, index) => (
						<ProjectCard key={project.id} project={project} index={index} />
					))}
				</div>
			</div>
		</div>
	);
};

export default Work;
