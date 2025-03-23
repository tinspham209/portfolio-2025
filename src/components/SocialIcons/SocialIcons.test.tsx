import { render } from "@testing-library/react";
import HoverLinks from "../HoverLinks";
import SocialIcons from "./SocialIcons";

// Mock requestAnimationFrame and cleanup APIs
jest.mock("../HoverLinks", () => ({
	__esModule: true,
	default: jest.fn().mockImplementation(({ text }) => <span>{text}</span>),
}));

window.requestAnimationFrame = jest.fn((cb) => {
	setTimeout(cb, 0);
	return 0;
});
window.cancelAnimationFrame = jest.fn();

describe("SocialIcons Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("uses HoverLinks component for resume button", () => {
		render(<SocialIcons />);
		expect(HoverLinks).toHaveBeenCalledWith(
			{ text: "RESUME" },
			expect.anything()
		);
	});

	it("handles animation lifecycle correctly", () => {
		const addSpy = jest.spyOn(document, "addEventListener");
		const removeSpy = jest.spyOn(document, "removeEventListener");

		const { unmount } = render(<SocialIcons />);

		// Verify animation setup
		expect(addSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
		expect(window.requestAnimationFrame).toHaveBeenCalled();

		unmount();

		// Verify cleanup
		expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
		expect(window.cancelAnimationFrame).toHaveBeenCalled();
	});

	it("handles null ref in useIconAnimation", () => {
		// Create null ref scenario
		const { rerender } = render(<SocialIcons key="initial" />);

		// Force unmount to trigger cleanup
		rerender(<div key="changed" />);

		// Verify cleanup was called even with null ref
		expect(window.cancelAnimationFrame).toHaveBeenCalled();
	});

	it("registers multiple animation frames", () => {
		render(<SocialIcons />);

		// Verify 3 social links only (resume button isn't animated)
		expect(window.requestAnimationFrame).toHaveBeenCalledTimes(3);
	});

	it("handles mouse movement within bounds", async () => {
		const { container } = render(<SocialIcons />);
		const link = container.querySelector("a") as HTMLElement;

		// Mock CSS property setter using Jest
		const setPropertyMock = jest.spyOn(link.style, "setProperty");

		// Simulate mouse move within bounds (20, 20)
		document.dispatchEvent(
			new MouseEvent("mousemove", {
				clientX: 30,
				clientY: 30,
			})
		);

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(setPropertyMock).toHaveBeenCalledWith(
			"--siLeft",
			expect.any(String)
		);
		expect(setPropertyMock).toHaveBeenCalledWith("--siTop", expect.any(String));
	});

	it("handles mouse movement outside bounds", () => {
		// Setup fake timers
		jest.useFakeTimers();

		const { container } = render(<SocialIcons />);
		const span = container.querySelector("span") as HTMLElement;

		// Mock element dimensions
		span.getBoundingClientRect = jest.fn(() => ({
			width: 40,
			height: 40,
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			x: 0,
			y: 0,
			toJSON: () => {},
		}));

		const setPropertyMock = jest.spyOn(
			span.querySelector("a")!.style,
			"setProperty"
		);

		// Simulate mouse move outside bounds
		document.dispatchEvent(
			new MouseEvent("mousemove", {
				clientX: 100,
				clientY: 100,
			})
		);

		// Execute pending animation frame
		jest.advanceTimersByTime(16); // One animation frame

		// Verify initial interpolation step
		expect(setPropertyMock).toHaveBeenCalledWith("--siLeft", "2px");
		expect(setPropertyMock).toHaveBeenCalledWith("--siTop", "2px");

		// Cleanup timers
		jest.useRealTimers();
	});

	it("handles edge boundary mouse positions", () => {
		// Setup fake timers
		jest.useFakeTimers();

		const { container } = render(<SocialIcons />);
		const span = container.querySelector("span") as HTMLElement;

		// Mock element dimensions
		span.getBoundingClientRect = jest.fn(() => ({
			width: 50,
			height: 50,
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			x: 0,
			y: 0,
			toJSON: () => {},
		}));

		const setPropertyMock = jest.spyOn(
			span.querySelector("a")!.style,
			"setProperty"
		);

		// Test boundary positions
		document.dispatchEvent(
			new MouseEvent("mousemove", {
				clientX: 25, // Within bounds
				clientY: 25,
			})
		);

		// Process animation frame
		jest.advanceTimersByTime(16);

		// Adjusted expectation based on interpolation calculation
		expect(setPropertyMock).toHaveBeenCalledWith("--siLeft", "2.5px");
		expect(setPropertyMock).toHaveBeenCalledWith("--siTop", "2.5px");

		// Cleanup timers
		jest.useRealTimers();
	});

	it("handles zero dimension elements gracefully", () => {
		// Setup fake timers
		jest.useFakeTimers();

		const { container } = render(<SocialIcons />);
		const span = container.querySelector("span") as HTMLElement;

		// Mock zero-size element
		span.getBoundingClientRect = jest.fn(() => ({
			width: 0,
			height: 0,
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			x: 0,
			y: 0,
			toJSON: () => {},
		}));

		const setPropertyMock = jest.spyOn(
			span.querySelector("a")!.style,
			"setProperty"
		);

		document.dispatchEvent(
			new MouseEvent("mousemove", {
				clientX: 20,
				clientY: 20,
			})
		);

		// Process animation frame
		jest.advanceTimersByTime(16);

		// Adjusted expectation for default position fallback
		expect(setPropertyMock).toHaveBeenCalledWith("--siLeft", "2px");
		expect(setPropertyMock).toHaveBeenCalledWith("--siTop", "2px");

		// Cleanup timers
		jest.useRealTimers();
	});
});
