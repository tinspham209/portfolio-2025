import { useEffect, useRef, FC } from "react";
import "./WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Types
interface Skill {
	title: string;
	description: string;
	skills: string[];
	borderType: "both" | "bottom";
}

// SVG Line component
const SVGLine: FC<{
	x1: string;
	y1: string;
	x2: string;
	y2: string;
	dasharray: string;
}> = ({ x1, y1, x2, y2, dasharray }) => (
	<line
		x1={x1}
		y1={y1}
		x2={x2}
		y2={y2}
		stroke="white"
		strokeWidth="2"
		strokeDasharray={dasharray}
	/>
);

// Skill Card Component
const SkillCard: FC<{
	skill: Skill;
	index: number;
	setRef: (el: HTMLDivElement | null, index: number) => void;
}> = ({ skill, index, setRef }) => {
	return (
		<div className="what-content what-noTouch" ref={(el) => setRef(el, index)}>
			<div className="what-border1">
				<svg height="100%">
					{skill.borderType === "both" && (
						<SVGLine x1="0" y1="0" x2="100%" y2="0" dasharray="6,6" />
					)}
					<SVGLine x1="0" y1="100%" x2="100%" y2="100%" dasharray="6,6" />
				</svg>
			</div>
			<div className="what-corner"></div>

			<div className="what-content-in">
				<h3>{skill.title}</h3>
				<h4>Description</h4>
				<p>{skill.description}</p>
				<h5>Skillset & tools</h5>
				<div className="what-content-flex">
					{skill.skills.map((tag, i) => (
						<div key={i} className="what-tags">
							{tag}
						</div>
					))}
				</div>
				<div className="what-arrow"></div>
			</div>
		</div>
	);
};

// Main component
const WhatIDo: FC = () => {
	const containerRef = useRef<(HTMLDivElement | null)[]>([]);

	const setRef = (el: HTMLDivElement | null, index: number) => {
		containerRef.current[index] = el;
	};

	// Handle click on skill card
	const handleClick = (container: HTMLDivElement) => {
		container.classList.toggle("what-content-active");
		container.classList.remove("what-sibling");

		if (container.parentElement) {
			const siblings = Array.from(container.parentElement.children);

			siblings.forEach((sibling) => {
				if (sibling !== container && sibling instanceof HTMLElement) {
					sibling.classList.remove("what-content-active");
					sibling.classList.toggle("what-sibling");
				}
			});
		}
	};

	useEffect(() => {
		const currentContainers = containerRef.current;
		const clickHandlers: { [key: number]: (event: MouseEvent) => void } = {};

		if (ScrollTrigger.isTouch) {
			containerRef.current.forEach((container, index) => {
				if (container) {
					container.classList.remove("what-noTouch");

					const handler = () => handleClick(container);
					clickHandlers[index] = handler;

					container.addEventListener("click", handler);
				}
			});
		}

		return () => {
			currentContainers.forEach((container, index) => {
				if (container && clickHandlers[index]) {
					container.removeEventListener("click", clickHandlers[index]);
				}
			});
		};
	}, []);

	return (
		<div className="whatIDO">
			<div className="what-box">
				<h2 className="title">
					W<span className="hat-h2">HAT</span>
					<div>
						I<span className="do-h2"> DO</span>
					</div>
				</h2>
			</div>
			<div className="what-box">
				<div className="what-box-in">
					<div className="what-border2">
						<svg width="100%">
							<SVGLine x1="0" y1="0" x2="0" y2="100%" dasharray="7,7" />
							<SVGLine x1="100%" y1="0" x2="100%" y2="100%" dasharray="7,7" />
						</svg>
					</div>

					{skillsData.map((skill, index) => (
						<SkillCard
							key={index}
							skill={skill}
							index={index}
							setRef={setRef}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

const skillsData: Skill[] = [
	{
		title: "DEVELOPER",
		description:
			"Experience in designing and implementing Front-end architectures. I have expertise in React, and its ecosystem.",
		skills: [
			"JavaScript",
			"TypeScript",
			"React",
			"Next.js",
			"CSS",
			"Storybook",
			"Remix.js",
		],
		borderType: "both",
	},
	{
		title: "DESIGNER",
		description:
			"I started designing as my hobby, and have been improving my skills since.",
		skills: ["UI Design", "Figma", "PhotoShop", "Adobe Premiere"],
		borderType: "bottom",
	},
];

export default WhatIDo;
