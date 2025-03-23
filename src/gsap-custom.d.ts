declare module "*.min.js" {
	export class ScrollSmoother {
		static create(config?: unknown): ScrollSmoother;
		static refresh(force: boolean): void;
		scrollTop(value: number): void;
		paused(value: boolean): void;
		scrollTo(
			target: string | number,
			smooth?: boolean,
			position?: string
		): void;
	}
}
