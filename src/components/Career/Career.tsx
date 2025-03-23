import { FC } from "react";
import "./Career.css";

interface CareerItem {
	position: string;
	company: string;
	companyUrl?: string;
	year: string;
	description: string;
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
		position: "Freelancer Web Developer",
		company: "My home",
		year: "2020",
		description: `I've been working as a freelancer for the past ${calculateYearsFromDate(
			"August 2020"
		)} years, and have been improving my skills since.`,
	},
	{
		position: "Software Engineer Intern",
		company: "DataHouse",
		companyUrl: "https://www.datahouse.com/",
		year: "2021",
		description:
			"I participated in the Summer Software Engineer internship at DataHouse Asia as a Frontend Web Developer.",
	},
	{
		position: "Software Engineer",
		company: "DataHouse",
		companyUrl: "https://www.datahouse.com/",
		year: "NOW",
		description: `Focused on Front-end architecture design, and development. Responsibilities include requirements analysis, UI implementation, code quality assurance, team management, and training/mentoring.`,
	},
];

const CareerItem: FC<CareerItem> = ({
	position,
	company,
	companyUrl,
	year,
	description,
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
			<p>{description}</p>
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
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default Career;
