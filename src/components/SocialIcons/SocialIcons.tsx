import { useEffect, useRef, FC } from "react";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { TbNotes } from "react-icons/tb";
import HoverLinks from "../HoverLinks";
import "./SocialIcons.css";

const SocialIcons: FC = () => {
	const socialRef = useRef<HTMLDivElement>(null);

	useIconAnimation(socialRef);

	return (
		<div className="icons-section">
			<div
				className="social-icons"
				data-cursor="icons"
				id="social"
				ref={socialRef}
			>
				{socialLinks.map((link, index) => (
					<span key={index}>
						<a href={link.href} target="_blank" rel="noopener noreferrer">
							{link.icon}
						</a>
					</span>
				))}
			</div>
			<a
				className="resume-button"
				href="/cv.pdf"
				target="_blank"
				rel="noopener noreferrer"
			>
				<HoverLinks text="RESUME" />
				<span>
					<TbNotes data-testid="resume-icon" />
				</span>
			</a>
		</div>
	);
};

// Custom hook for icon hover animation
const useIconAnimation = (socialRef: React.RefObject<HTMLDivElement>) => {
	useEffect(() => {
		if (!socialRef.current) return;

		const spans = socialRef.current.querySelectorAll("span");
		const cleanupFunctions: (() => void)[] = [];

		spans.forEach((item) => {
			const elem = item as HTMLElement;
			const link = elem.querySelector("a") as HTMLElement;

			const rect = elem.getBoundingClientRect();
			let mouseX = rect.width / 2;
			let mouseY = rect.height / 2;
			let currentX = 0;
			let currentY = 0;

			// Animation frame ID for cleanup
			let animationFrameId: number;

			const updatePosition = () => {
				currentX += (mouseX - currentX) * 0.1;
				currentY += (mouseY - currentY) * 0.1;

				link.style.setProperty("--siLeft", `${currentX}px`);
				link.style.setProperty("--siTop", `${currentY}px`);

				animationFrameId = requestAnimationFrame(updatePosition);
			};

			const onMouseMove = (e: MouseEvent) => {
				const updatedRect = elem.getBoundingClientRect();
				const x = e.clientX - updatedRect.left;
				const y = e.clientY - updatedRect.top;

				if (x < 40 && x > 10 && y < 40 && y > 5) {
					mouseX = x;
					mouseY = y;
				} else {
					mouseX = updatedRect.width / 2;
					mouseY = updatedRect.height / 2;
				}
			};

			document.addEventListener("mousemove", onMouseMove);
			animationFrameId = requestAnimationFrame(updatePosition);

			// Add cleanup function
			cleanupFunctions.push(() => {
				document.removeEventListener("mousemove", onMouseMove);
				cancelAnimationFrame(animationFrameId);
			});
		});

		// Return cleanup function
		return () => {
			cleanupFunctions.forEach((cleanup) => cleanup());
		};
	}, [socialRef]);
};

interface SocialLink {
	href: string;
	icon: JSX.Element;
}

const socialLinks: SocialLink[] = [
	{
		href: "https://github.com/tinspham209",
		icon: <FaGithub />,
	},
	{
		href: "https://www.linkedin.com/in/phamvantins/",
		icon: <FaLinkedinIn />,
	},
	{
		href: "https://www.instagram.com/phamthitins",
		icon: <FaInstagram />,
	},
];

export default SocialIcons;
