/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, FC } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "../HoverLinks";
import { gsap } from "gsap";
// @ts-ignore
import { ScrollSmoother } from "../../lib/gsap/ScrollSmoother.min.js";
import "./Navbar.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

// Constants
const SCROLL_CONFIG = {
	wrapper: "#smooth-wrapper",
	content: "#smooth-content",
	smooth: 1.7,
	speed: 1.7,
	effects: true,
	autoResize: true,
	ignoreMobileResize: true,
};

const DESKTOP_WIDTH = 1024;

// NavLink type
interface NavLinkProps {
	href: string;
	text: string;
}

// NavLinks component
const NavLinks: FC = () => {
	const links: NavLinkProps[] = [
		{ href: "#about", text: "ABOUT" },
		{ href: "#work", text: "WORK" },
		{ href: "#contact", text: "CONTACT" },
	];

	return (
		<ul>
			{links.map(({ href, text }) => (
				<li key={href}>
					<a data-href={href} href={href}>
						<HoverLinks text={text} />
					</a>
				</li>
			))}
		</ul>
	);
};

const Navbar: FC = () => {
	const headerRef = useRef<HTMLDivElement>(null);

	// Handle navigation click
	const handleNavClick = (e: MouseEvent) => {
		if (window.innerWidth <= DESKTOP_WIDTH) return;

		e.preventDefault();
		const target = e.currentTarget as HTMLAnchorElement;
		const section = target.getAttribute("data-href");
		smoother.scrollTo(section, true, "top top");
	};

	// Initialize scroll smoother and event listeners
	useEffect(() => {
		// Create scroll smoother
		smoother = ScrollSmoother.create(SCROLL_CONFIG);
		smoother.scrollTop(0);
		smoother.paused(true);

		// Add click event listeners to navigation links
		if (headerRef.current) {
			const links = headerRef.current.querySelectorAll("ul a");
			links.forEach((link) => {
				link.addEventListener("click", handleNavClick as EventListener);
			});
		}

		// Handle window resize
		const handleResize = () => {
			ScrollSmoother.refresh(true);
		};
		window.addEventListener("resize", handleResize);

		// Cleanup event listeners
		return () => {
			if (headerRef.current) {
				const links = headerRef.current.querySelectorAll("ul a");
				links.forEach((link) => {
					link.removeEventListener("click", handleNavClick as EventListener);
				});
			}
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<>
			<div className="header" ref={headerRef}>
				<a href="/#" className="navbar-title" data-cursor="disable">
					<img
						src="/personal/full-nguoi-edit.webp"
						alt="avatar"
						width={50}
						height={50}
					/>
				</a>
				<a
					href="mailto:tinphamvan123@gmail.com"
					className="navbar-connect"
					data-cursor="disable"
				>
					tinphamvan123@gmail.com
				</a>
				<NavLinks />
			</div>

			<div className="landing-circle1"></div>
			<div className="landing-circle2"></div>
			<div className="nav-fade"></div>
		</>
	);
};

export default Navbar;
