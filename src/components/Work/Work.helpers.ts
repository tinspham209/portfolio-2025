export interface Project {
	id: string;
	title: string;
	category: string;
	tools: string[];
	image: string;
}

export const projects: Project[] = [
	{
		id: "tourbook",
		title: "TourBook",
		category: "Web",
		tools: ["React", "Mantine UI", "TypeScript"],
		image: "/projects/tourbook.webp",
	},
	{
		id: "tieudiem",
		title: "Tieudiem.org",
		category: "Web",
		tools: ["React", "Mantine UI", "TypeScript"],
		image: "/projects/tieudiem.webp",
	},
	{
		id: "inut-design",
		title: "INUT Design",
		category: "Web",
		tools: [
			"Next.js 12",
			"Sanity.io",
			"MUI",
			"TypeScript",
			"useSWR",
			"Framer motion",
			"Firebase",
			"SEO",
		],
		image: "/projects/inut-design.webp",
	},
	{
		id: "anhung",
		title: "Công ty xây dựng An Hưng",
		category: "Web",
		tools: ["Next.js 13", "Sanity.io", "shadnui", "SEO"],
		image: "/projects/anhung.webp",
	},
	{
		id: "pwt",
		title: "Công ty Liên kết Toàn cầu PWT",
		category: "Web",
		tools: ["Next.js 13", "shadnui", "SEO"],
		image: "/projects/pwt.webp",
	},
	{
		id: "y-khoa-ky-thuat-cao",
		title: "Phòng xét nghiệm y khoa kỹ thuật cao",
		category: "Web",
		tools: ["Next.js 13", "shadnui", "SEO"],
		image: "/projects/y-khoa-ky-thuat-cao.webp",
	},
	{
		id: "etech",
		title: "Etech",
		category: "Web",
		tools: ["React", "TailwindCSS", "SEO"],
		image: "/projects/etech.webp",
	},
	{
		id: "kingstonedanang",
		title: "Kingstonedanang",
		category: "Web",
		tools: ["React", "Santiy.io", "Redux", "MUI", "Firebase", "SEO"],
		image: "/projects/kingstonedanang.webp",
	},
	{
		id: "cafesang",
		title: "Cafesang",
		category: "Web",
		tools: ["React", "Redux", "MUI", "Firebase"],
		image: "/projects/cafesang.webp",
	},
	{
		id: "noor-cafe",
		title: "NOOR Coffee",
		category: "Web",
		tools: ["React", "Santiy.io", "Redux", "MUI", "Firebase", "SEO"],
		image: "/projects/noor-cafe.webp",
	},
	{
		id: "noor-kombucha",
		title: "NOOR Kombucha",
		category: "Web",
		tools: ["React", "Santiy.io", "Redux", "MUI", "Firebase", "SEO"],
		image: "/projects/noor-kombucha.webp",
	},
	{
		id: "taptaponme",
		title: "Taptapon.me",
		category: "Web",
		tools: ["React", "Santiy.io", "Redux", "MUI", "Firebase", "SEO"],
		image: "/projects/taptaponme.webp",
	},
	{
		id: "topdup",
		title: "Topdup",
		category: "Web",
		tools: ["React"],
		image: "/projects/topdup.webp",
	},
	{
		id: "covid-tracker",
		title: "Covid Tracker",
		category: "Web",
		tools: ["React", "MUI", "chart.js", "leaflet", "disease.sh"],
		image: "/projects/covid-tracker.webp",
	},
];
