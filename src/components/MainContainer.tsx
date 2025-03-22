import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About/About";
import Career from "./Career/Career";
import Contact from "./Contact/Contact";
import Cursor from "./Cursor/Cursor";
import Landing from "./Landing/Landing";
import Navbar from "./Navbar/Navbar";
import SocialIcons from "./SocialIcons/SocialIcons";
import WhatIDo from "./WhatIDo/WhatIDo";
import Work from "./Work/Work";
import setSplitText from "./utils/splitText";

const TechStack = lazy(() => import("./TechStack/TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
	const [isDesktopView, setIsDesktopView] = useState<boolean>(
		window.innerWidth > 1024
	);

	useEffect(() => {
		const resizeHandler = () => {
			setSplitText();
			setIsDesktopView(window.innerWidth > 1024);
		};
		resizeHandler();
		window.addEventListener("resize", resizeHandler);
		return () => {
			window.removeEventListener("resize", resizeHandler);
		};
	}, [isDesktopView]);

	return (
		<div className="container-main">
			<Cursor />
			<Navbar />
			<SocialIcons />
			{isDesktopView && children}
			<div id="smooth-wrapper">
				<div id="smooth-content">
					<div className="container-main">
						<Landing>{!isDesktopView && children}</Landing>
						<About />
						<WhatIDo />
						<Career />
						<Work />
						{isDesktopView && (
							<Suspense fallback={<div>Loading....</div>}>
								<TechStack />
							</Suspense>
						)}
						<Contact />
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainContainer;
