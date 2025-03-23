import { fireEvent, render, screen } from "@testing-library/react";
import { ScrollSmoother } from "../../lib/gsap/ScrollSmoother.min.js";
import HoverLinks from "../HoverLinks";
import Navbar from "./Navbar";

jest.mock("../HoverLinks", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(({ text }) => <span>{text}</span>),
}));

jest.mock("gsap", () => ({
	__esModule: true,
	gsap: {
		registerPlugin: jest.fn(),
	},
	default: {
		registerPlugin: jest.fn(),
	},
}));

jest.mock("gsap/ScrollTrigger", () => ({
	ScrollTrigger: {
		refresh: jest.fn(),
	},
}));

jest.mock("../../lib/gsap/ScrollSmoother.min.js", () => ({
	ScrollSmoother: {
		create: jest.fn(() => ({
			scrollTo: jest.fn(),
			paused: jest.fn(),
			scrollTop: jest.fn(),
		})),
		refresh: jest.fn(),
	},
}));

describe("Navbar Component", () => {
	const originalInnerWidth = window.innerWidth;
	let scrollSmootherInstance: {
		scrollTo: jest.Mock;
		paused: jest.Mock;
		scrollTop: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1025,
		});
		scrollSmootherInstance = {
			scrollTo: jest.fn(),
			paused: jest.fn(),
			scrollTop: jest.fn(),
		};
		(ScrollSmoother.create as jest.Mock).mockReturnValue(
			scrollSmootherInstance
		);
	});

	afterEach(() => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		});
	});

	it("renders without crashing", () => {
		render(<Navbar />);
		expect(screen.getByAltText("avatar")).toBeInTheDocument();
		expect(screen.getByText("tinphamvan123@gmail.com")).toBeInTheDocument();
	});

	it("initializes ScrollSmoother and event listeners", () => {
		render(<Navbar />);
		expect(ScrollSmoother.create).toHaveBeenCalledWith({
			wrapper: "#smooth-wrapper",
			content: "#smooth-content",
			smooth: 1.7,
			speed: 1.7,
			effects: true,
			autoResize: true,
			ignoreMobileResize: true,
		});
	});

	it("handles navigation clicks on desktop", () => {
		render(<Navbar />);
		const aboutLink = screen.getByText("ABOUT").closest("a");
		if (aboutLink) {
			fireEvent.click(aboutLink);
			expect(scrollSmootherInstance.scrollTo).toHaveBeenCalledWith(
				"#about",
				true,
				"top top"
			);
		}
	});

	it("uses HoverLinks component for navigation items", () => {
		render(<Navbar />);
		expect(HoverLinks).toHaveBeenCalledWith(
			{ text: "ABOUT" },
			expect.any(Object)
		);
		expect(HoverLinks).toHaveBeenCalledWith(
			{ text: "WORK" },
			expect.any(Object)
		);
		expect(HoverLinks).toHaveBeenCalledWith(
			{ text: "CONTACT" },
			expect.any(Object)
		);
	});

	it("handles navigation click events properly", () => {
		render(<Navbar />);
		const links = screen.getAllByRole("link");
		expect(links).toHaveLength(5);
		links.forEach((link) => {
			expect(link).toHaveAttribute("href");
		});
	});

	it("doesn't handle navigation clicks on mobile", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1023,
		});

		render(<Navbar />);
		const aboutLink = screen.getByText("ABOUT").closest("a");
		if (aboutLink) {
			fireEvent.click(aboutLink);
			expect(scrollSmootherInstance.scrollTo).not.toHaveBeenCalled();
		}
	});

	it("handles window resize", () => {
		render(<Navbar />);
		fireEvent.resize(window);
		expect(ScrollSmoother.refresh).toHaveBeenCalledWith(true);
	});

	it("cleans up event listeners on unmount", () => {
		// Spy on prototype before component mounts
		const removeClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "removeEventListener");
		const { unmount } = render(<Navbar />);
		const removeResizeSpy = jest.spyOn(window, "removeEventListener");

		unmount();

		expect(removeResizeSpy).toHaveBeenCalledWith(
			"resize",
			expect.any(Function)
		);
		
		// Verify 3 navigation links had click listeners removed
		expect(removeClickSpy).toHaveBeenCalledTimes(3);
		expect(removeClickSpy.mock.calls.every(call => 
			call[0] === "click" && typeof call[1] === "function"
		)).toBe(true);
	});

	it("renders all navigation links", () => {
		render(<Navbar />);
		expect(screen.getByText("ABOUT")).toBeInTheDocument();
		expect(screen.getByText("WORK")).toBeInTheDocument();
		expect(screen.getByText("CONTACT")).toBeInTheDocument();
	});

	it("initializes ScrollSmoother with correct configuration", () => {
		render(<Navbar />);
		expect(scrollSmootherInstance.paused).toHaveBeenCalledWith(true);
		expect(scrollSmootherInstance.scrollTop).toHaveBeenCalledWith(0);
	});

	it("handles navigation link click events with proper scroll behavior", () => {
		render(<Navbar />);
		const workLink = screen.getByText("WORK").closest("a");
		if (workLink) {
			fireEvent.click(workLink);
			expect(scrollSmootherInstance.scrollTo).toHaveBeenCalledWith(
				"#work",
				true,
				"top top"
			);
		}
	});

	it("NavLinks component renders all navigation items with correct attributes", () => {
		render(<Navbar />);
		const navItems = ["ABOUT", "WORK", "CONTACT"];
		navItems.forEach((item) => {
			const link = screen.getByText(item).closest("a");
			expect(link).toHaveAttribute("data-href", `#${item.toLowerCase()}`);
			expect(link).toHaveAttribute("href", `#${item.toLowerCase()}`);
		});
	});
});
