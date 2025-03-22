import { FC } from "react";
import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./Contact.css";

// Types for contact information
interface ContactInfo {
	type: string;
	value: string;
	href: string;
}

interface SocialLink {
	name: string;
	url: string;
}

// Contact data
const contactInfo: ContactInfo[] = [
	{
		type: "Email",
		value: "tinphamvan123@gmail.com",
		href: "mailto:tinphamvan123@gmail.com",
	},
	{
		type: "Location",
		value: "Da Nang, Vietnam",
		href: "https://maps.app.goo.gl/ge1TPTC5qtwEjMS8A",
	},
];

const socialLinks: SocialLink[] = [
	{
		name: "Github",
		url: "https://github.com/tinspham209",
	},
	{
		name: "Linkedin",
		url: "https://www.linkedin.com/in/phamvantins/",
	},
	{
		name: "Instagram",
		url: "https://www.instagram.com/phamthitins",
	},
];

// Components
const ContactItem: FC<{ info: ContactInfo }> = ({ info }) => (
	<>
		<h4>{info.type}</h4>
		<p>
			<a
				href={info.href}
				data-cursor="disable"
				target="_blank"
				rel="noopener noreferrer"
			>
				{info.value}
			</a>
		</p>
	</>
);

const SocialItem: FC<{ link: SocialLink }> = ({ link }) => (
	<a
		href={link.url}
		target="_blank"
		rel="noopener noreferrer"
		data-cursor="disable"
		className="contact-social"
	>
		{link.name} <MdArrowOutward />
	</a>
);

const Contact: FC = () => {
	const currentYear = new Date().getFullYear();

	return (
		<div className="contact-section section-container" id="contact">
			<div className="contact-container">
				<h3>Contact</h3>
				<div className="contact-flex">
					<div className="contact-box">
						{contactInfo.map((info, index) => (
							<ContactItem key={index} info={info} />
						))}
					</div>

					<div className="contact-box">
						<h4>Social</h4>
						{socialLinks.map((link, index) => (
							<SocialItem key={index} link={link} />
						))}
					</div>

					<div className="contact-box">
						<h2>
							Designed and Developed <br /> by <span>Tin Pham</span>
						</h2>
						<img
							src="personal/full-nguoi-edit.webp"
							alt="Tin Pham"
							className="contact-box__image"
						/>
						<h5>
							<MdCopyright /> {currentYear}
						</h5>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
