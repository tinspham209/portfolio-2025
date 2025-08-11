import { FC } from "react";
import "./Career.css";

interface CareerItem {
	position: string;
	company: string;
	companyUrl?: string;
	year: string;
	description: string;
	tags?: string[];
}

// Function to calculate years from a given date until now
const calculateYearsFromDate = (startDate: string): number => {
	const start = new Date(startDate);
	const now = new Date();
	const diffInYears =
		(now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
	return Math.floor(diffInYears);
};

const careerData: CareerItem[] = [
	{
		position: "Co-Founder",
		company: "NOOR",
		companyUrl: "https://noor-cf.web.app/about",
		year: "2019",
		description: `Part of the founding team of NOOR, a Vietnamese startup focused on creating high-quality, healthy beverages.`,
		tags: ["NOOR Coffee & Tea", "NOOR Kombucha", "NOOR Light", "NOOR Studio"],
	},
	{
		position: "Freelancer Web Developer",
		company: "My home",
		year: "2020",
		description: `I've been working as a freelancer for the past ${calculateYearsFromDate(
			"August 2020"
		)} years, and have been improving my skills since.`,
		tags: ["React", "Next.js", "WordPress", "Sanity CMS", "SEO"],
	},
	{
		position: "Software Engineer Intern",
		company: "DataHouse",
		companyUrl: "https://www.datahouse.com/",
		year: "2021",
		description:
			"I participated in the Summer Software Engineer internship at DataHouse Asia as a Frontend Web Developer.",
		tags: ["JavaScript", "TypeScript", "React", "React Native", "Angular"],
	},
	{
		position: "Software Engineer",
		company: "DataHouse",
		companyUrl: "https://www.datahouse.com/",
		year: "2025",
		description: `Focused on Front-end architecture design, and development. Responsibilities include requirements analysis, UI implementation, code quality assurance, team management, and training/mentoring.`,
		tags: [
			"JavaScript",
			"TypeScript",
			"React",
			"Angular",
			"Storybook",
			"UI libraries",
			"Lerna Monorepos",
			"Micro-frontends",
		],
	},
	{
		position: "Full-Stack Developer",
		company: "ONE Tech Stop Viet Nam",
		companyUrl: "http://ots.one-line.com/",
		year: "NOW",
		description: `Participate in the Design System team. Focused on building reusable React components and libraries for over 40 company's internal teams.`,
		tags: [
			"JavaScript",
			"TypeScript",
			"React",
			"Next.js",
			"Storybook",
			"Design System",
			"UI libraries",
			"Turborepo",
		],
	},
];

const CareerItem: FC<CareerItem> = ({
	position,
	company,
	companyUrl,
	year,
	description,
	tags,
}) => {
	return (
		<div className="career-info-box">
			<div className="career-info-in">
				<div className="career-role">
					<h4>{position}</h4>
					<h5>
						{companyUrl ? (
							<a href={companyUrl} target="_blank" rel="noopener noreferrer">
								{company}
							</a>
						) : (
							company
						)}
					</h5>
				</div>
				<h3>{year}</h3>
			</div>
			<p>
				{description}
				{tags && tags.length > 0 && (
					<span className="career-content-flex">
						{tags?.map((tag, i) => (
							<span key={i} className="career-tags">
								{tag}
							</span>
						))}
					</span>
				)}
			</p>
		</div>
	);
};

const Career: FC = () => {
	return (
		<div className="career-section section-container">
			<div className="career-container">
				<h2>
					My career <span>&</span>
					<br /> experience
				</h2>
				<div className="career-info">
					<div className="career-timeline">
						<div className="career-dot"></div>
					</div>

					{careerData.map((item, index) => (
						<CareerItem
							key={`${item.position}-${index}`}
							position={item.position}
							company={item.company}
							companyUrl={item.companyUrl}
							year={item.year}
							description={item.description}
							tags={item.tags}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default Career;
