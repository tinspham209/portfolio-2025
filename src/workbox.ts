import { messageSW, Workbox } from "workbox-window";
import { WorkboxLifecycleEvent } from "workbox-window/utils/WorkboxEvent";

const isLocalhost = Boolean(
	window.location.hostname === "localhost" ||
		// [::1] is the IPv6 localhost address.
		window.location.hostname === "[::1]" ||
		// 127.0.0.0/8 are considered localhost for IPv4.
		window.location.hostname.match(
			/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
		)
);

export const register = () => {
	if (!isLocalhost) {
		if (import.meta.env.MODE === "production" && "serviceWorker" in navigator) {
			const wb = new Workbox("/service-worker.js");
			let registration: ServiceWorkerRegistration;

			const showSkipWaitingPrompt = () => {
				wb.addEventListener("controlling", () => {
					window.location.reload();
				});

				if (registration && registration.waiting) {
					messageSW(registration.waiting, { type: "SKIP_WAITING" });
				}
			};

			wb.addEventListener("installed", (event: WorkboxLifecycleEvent) => {
				if (event.isUpdate) {
					console.log("🔄🔄🔄 Reload window to remove cache");
					window.location.reload();
				}
			});

			wb.addEventListener("waiting", showSkipWaitingPrompt);

			wb.register().then((response?: ServiceWorkerRegistration) => {
				if (!response) return;

				registration = response;
				console.log("✔️✔️✔️ Service Worker Registration Successfully!");
			});
		}
	}
};
