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
				title: "Dashboard",
				path: "#/dashboard",
				icon: (
					<LayoutGridIcon
					/>
				),
				isActive: true,
			},
			{
				title: "Sales",
				path: "#/sales",
				icon: (
					<BarChart3Icon
					/>
				),
			},
		],
	},
	{
		label: "Store",
		items: [
			{
				title: "Orders",
				path: "#/orders",
				icon: (
					<ShoppingCartIcon
					/>
				),
				subItems: [
					{ title: "All orders", path: "#/orders/all" },
					{ title: "Unfulfilled", path: "#/orders/unfulfilled" },
					{ title: "Returns", path: "#/orders/returns" },
				],
			},
			{
				title: "Products",
				path: "#/products",
				icon: (
					<FileTextIcon
					/>
				),
				subItems: [
					{ title: "Catalog", path: "#/products/catalog" },
					{ title: "Inventory", path: "#/products/inventory" },
					{ title: "Collections", path: "#/products/collections" },
				],
			},
			{
				title: "Customers",
				path: "#/customers",
				icon: (
					<UsersIcon
					/>
				),
			},
			{
				title: "Marketing",
				path: "#/marketing",
				icon: (
					<MegaphoneIcon
					/>
				),
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				title: "Store settings",
				path: "#/store-settings",
				icon: (
					<SettingsIcon
					/>
				),
				subItems: [
					{ title: "Store profile", path: "#/store-settings/profile" },
					{ title: "Shipping & delivery", path: "#/store-settings/shipping" },
					{ title: "Payments", path: "#/store-settings/payments" },
					{ title: "Staff", path: "#/store-settings/staff" },
					{ title: "Apps", path: "#/store-settings/apps" },
				],
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
