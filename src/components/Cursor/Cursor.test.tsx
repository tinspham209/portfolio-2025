import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import gsap from "gsap";
import Cursor from "./Cursor";

jest.mock("gsap", () => ({
	to: jest.fn(),
}));

describe("Cursor Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Create a more complete DOM structure
		document.body.innerHTML = `
      <div id="root">
        <div data-cursor="icons" id="icon-element"></div>
        <div data-cursor="disable" id="disable-element"></div>
      </div>
    `;
	});

	afterEach(() => {
		document.body.innerHTML = "";
		jest.clearAllMocks();
	});

	it("renders cursor element", () => {
		render(<Cursor />);
		expect(screen.getByTestId("cursor")).toBeInTheDocument();
	});

	it("handles hover states", async () => {
		render(<Cursor />);

		// Wait for initial render and effects
		await act(async () => {
			const iconElement = document.getElementById("icon-element");
			const mouseOverEvent = new MouseEvent("mouseover", {
				bubbles: true,
				cancelable: true,
			});
			iconElement?.dispatchEvent(mouseOverEvent);
			// Wait for GSAP animation
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		expect(screen.getByTestId("cursor")).toHaveClass("cursor-icons");

		// Test mouseout
		await act(async () => {
			const iconElement = document.getElementById("icon-element");
			const mouseOutEvent = new MouseEvent("mouseout", {
				bubbles: true,
				cancelable: true,
			});
			iconElement?.dispatchEvent(mouseOutEvent);
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		expect(screen.getByTestId("cursor")).not.toHaveClass("cursor-icons");
	});

	it("handles disable state", async () => {
		render(<Cursor />);

		await act(async () => {
			const disableElement = document.getElementById("disable-element");
			const mouseOverEvent = new MouseEvent("mouseover", {
				bubbles: true,
				cancelable: true,
			});
			disableElement?.dispatchEvent(mouseOverEvent);
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		expect(screen.getByTestId("cursor")).toHaveClass("cursor-disable");
	});

	it("animates cursor position", async () => {
		render(<Cursor />);

		await act(async () => {
			const mouseEvent = new MouseEvent("mousemove", {
				clientX: 100,
				clientY: 200,
				bubbles: true,
			});
			document.dispatchEvent(mouseEvent);
			// Wait for animation frame
			await new Promise((resolve) => setTimeout(resolve, 100));
		});

		expect(gsap.to).toHaveBeenCalled();
		const calls = (gsap.to as jest.Mock).mock.calls;
		expect(calls[0][1]).toMatchObject({
			duration: 0.1,
		});
	});
});
