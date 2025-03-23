import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import { LoadingProvider } from "../../context/LoadingProvider";
import Loading, { setProgress } from "./Loading";
import React from "react";

const TIMEOUTS = {
	INITIAL_DELAY: 600,
	LOADING_DELAY: 1000,
	FINAL_DELAY: 900,
	TOTAL: 2500,
};

const advanceTimers = async (ms: number) => {
	await act(async () => {
		jest.advanceTimersByTime(ms);
	});
};

const advanceLoadingSequence = async () => {
	await advanceTimers(TIMEOUTS.INITIAL_DELAY);
	await advanceTimers(TIMEOUTS.LOADING_DELAY);
	await advanceTimers(TIMEOUTS.FINAL_DELAY);
};

const mockSetIsLoading = jest.fn();

jest.mock("react-fast-marquee", () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="marquee">{children}</div>
	),
}));

jest.mock("../utils/initialFX", () => ({
	initialFX: jest.fn(),
}));

jest.mock("../../context/LoadingProvider", () => ({
	LoadingProvider: ({ children }: { children: React.ReactNode }) => children,
	useLoading: () => ({
		setIsLoading: mockSetIsLoading,
	}),
}));

const renderWithProvider = (percent: number) => {
	return act(() => {
		render(
			<LoadingProvider>
				<Loading percent={percent} />
			</LoadingProvider>
		);
	});
};

describe("Loading Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		jest.mock("../utils/initialFX", () => ({
			initialFX: jest.fn(),
		}));
	});

	afterEach(() => {
		act(() => {
			jest.runOnlyPendingTimers();
		});
		jest.useRealTimers();
	});

	describe("Initial Rendering and Loading States", () => {
		it("renders initial loading state and updates percentage", async () => {
			await act(async () => {
				renderWithProvider(0);
			});
			expect(screen.getByText(/Loading/)).toBeInTheDocument();
			expect(screen.getByText("0%")).toBeInTheDocument();
			expect(screen.getByAltText("avatar")).toBeInTheDocument();

			await act(async () => {
				renderWithProvider(50);
			});
			expect(screen.getByText("50%")).toBeInTheDocument();
		});

		it("handles loading completion with initialFX", async () => {
			const initialFX = jest.requireMock("../utils/initialFX").initialFX;
			renderWithProvider(100);
			await advanceLoadingSequence();
			expect(initialFX).toHaveBeenCalled();
			expect(screen.getByTestId("loading-wrap")).toHaveClass("loading-clicked");
		});
	});

	describe("User Interactions", () => {
		it("handles mouse movement and click events", async () => {
			const { rerender } = render(
				<LoadingProvider>
					<Loading percent={0} />
				</LoadingProvider>
			);

			const loadingWrap = screen.getByTestId("loading-wrap");

			jest
				.spyOn(loadingWrap, "getBoundingClientRect")
				.mockImplementation(() => ({ left: 10, top: 20 } as DOMRect));

			await act(async () => {
				loadingWrap.dispatchEvent(
					new MouseEvent("mousemove", {
						clientX: 100,
						clientY: 50,
						bubbles: true,
					})
				);
			});

			expect(loadingWrap).toHaveStyle({
				"--mouse-x": "90px",
				"--mouse-y": "30px",
			});

			await act(async () => {
				rerender(
					<LoadingProvider>
						<Loading percent={100} />
					</LoadingProvider>
				);
			});
			await advanceLoadingSequence();

			const loadingButton = screen.getByTestId("loading-button");
			await act(async () => {
				loadingButton.click();
			});

			expect(mockSetIsLoading).toHaveBeenCalledWith(false);
			expect(loadingButton).toHaveClass("loading-complete");
			expect(screen.getByTestId("loading-wrap")).toHaveClass("loading-clicked");
		});
	});

	describe("Edge Cases", () => {
		it("handles loading completion with undefined initialFX", async () => {
			const mockModule = jest.requireMock("../utils/initialFX");
			mockModule.initialFX = undefined;

			await act(async () => {
				renderWithProvider(100);
			});
			await advanceLoadingSequence();

			const loadingButton = screen.getByTestId("loading-button");
			await act(async () => {
				loadingButton.click();
			});

			expect(screen.getByTestId("loading-wrap")).toHaveClass("loading-clicked");
			expect(loadingButton).toHaveClass("loading-complete");
			expect(mockSetIsLoading).toHaveBeenCalledWith(false);
		});

		it("handles early click and loading completion sequence", async () => {
			const mockModule = jest.requireMock("../utils/initialFX");
			const mockInitialFX = jest.fn(
				() => new Promise((resolve) => setTimeout(resolve, 1000))
			);
			mockModule.initialFX = mockInitialFX;

			await act(async () => {
				renderWithProvider(100);
			});

			const loadingButton = screen.getByTestId("loading-button");
			await act(async () => {
				loadingButton.click();
			});

			expect(screen.getByTestId("loading-wrap")).not.toHaveClass(
				"loading-clicked"
			);
			expect(loadingButton).not.toHaveClass("loading-complete");
			expect(mockSetIsLoading).not.toHaveBeenCalled();

			await advanceLoadingSequence();
			await act(async () => {
				jest.runAllTimers();
			});

			expect(mockSetIsLoading).toHaveBeenCalledWith(false);
			expect(screen.getByTestId("loading-wrap")).toHaveClass("loading-clicked");
		});
	});
});

describe("setProgress function", () => {
	let mockSetLoading: jest.Mock;

	beforeEach(() => {
		jest.useFakeTimers();
		mockSetLoading = jest.fn();
		const mockModule = jest.requireMock("../utils/initialFX");
		mockModule.initialFX = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it("handles complete progress lifecycle", async () => {
		const progress = setProgress(mockSetLoading);

		act(() => {
			jest.advanceTimersByTime(2100);
		});
		expect(mockSetLoading).toHaveBeenCalled();

		const loadedPromise = progress.loaded();
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		const result = await loadedPromise;
		expect(result).toBe(100);
		expect(mockSetLoading).toHaveBeenCalledWith(100);

		progress.clear();
		expect(mockSetLoading).toHaveBeenLastCalledWith(100);
	});

	it("handles interval clearing and loading completion", async () => {
		const progress = setProgress(mockSetLoading);

		act(() => {
			jest.advanceTimersByTime(100);
		});
		expect(mockSetLoading).toHaveBeenCalled();

		act(() => {
			jest.advanceTimersByTime(2000);
		});

		act(() => {
			jest.advanceTimersByTime(2000);
		});

		const loadedPromise = progress.loaded();
		act(() => {
			jest.advanceTimersByTime(500);
		});

		const result = await loadedPromise;
		expect(result).toBe(100);
		expect(mockSetLoading).toHaveBeenCalledWith(100);

		progress.clear();
		expect(mockSetLoading).toHaveBeenLastCalledWith(100);
	});
});
