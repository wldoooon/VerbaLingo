import type { ReactNode } from "react";
import { LayoutGridIcon, BarChart3Icon, ShoppingCartIcon, FileTextIcon, UsersIcon, MegaphoneIcon, SettingsIcon, HelpCircleIcon, ActivityIcon } from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Home",
				path: "#/",
				icon: (
					<LayoutGridIcon
					/>
				),
				isActive: true,
				subItems: [
					{ title: "Features", path: "#features" },
					{ title: "FAQ", path: "#faq" },
					{ title: "Contact Us", path: "#contact" },
				],
			},
		],
	},
	{
		label: "General",
		items: [
			{
				title: "Pricing",
				path: "#/pricing",
				icon: <BarChart3Icon />,
			},
			{
				title: "Changelog",
				path: "#/changelog",
				icon: <FileTextIcon />,
			},
			{
				title: "Support",
				path: "#/support",
				icon: <HelpCircleIcon />,
			},
			{
				title: "Feedback",
				path: "#/feedback",
				icon: <MegaphoneIcon />,
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				title: "Profile",
				path: "#/profile",
				icon: <UsersIcon />,
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Seller help",
		path: "#/seller-help",
		icon: (
			<HelpCircleIcon
			/>
		),
	},
	{
		title: "Platform status",
		path: "#/status",
		icon: (
			<ActivityIcon
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
