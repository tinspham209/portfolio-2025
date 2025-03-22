import { PropsWithChildren } from "react";
import "./Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
	return (
		<>
			<div className="landing-section" id="landingDiv">
				<div className="landing-container">
					<div className="landing-intro">
						<h2>Hello! I'm</h2>
						<h1>
							TINS
							<br />
							PHAM
						</h1>
						<span>{"<@tinspham209>"}</span>
					</div>
					<div className="landing-info">
						<h3>A Software Engineer</h3>
						<h2 className="landing-info-h2">
							<div className="landing-h2-1">Frontend</div>
							<div className="landing-h2-2">Developer</div>
						</h2>
						<h2>
							<div className="landing-h2-info">Developer</div>
							<div className="landing-h2-info-1">Frontend</div>
						</h2>
					</div>
				</div>
				{children}
			</div>
		</>
	);
};

export default Landing;
