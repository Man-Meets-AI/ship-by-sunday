import type { ComponentProps, ComponentType } from "react";
import type { PresetConfig } from "shadcn/preset";

import {
	BarChart3Icon as LuChart,
	BellIcon as LuBell,
	HomeIcon as LuHome,
	SettingsIcon as LuSettings,
} from "lucide-react";
import {
	IconBell as TbBell,
	IconChartBar as TbChart,
	IconHome as TbHome,
	IconSettings as TbSettings,
} from "@tabler/icons-react";
import {
	Bell as PhBell,
	ChartBar as PhChart,
	Gear as PhSettings,
	House as PhHome,
} from "@phosphor-icons/react";
import {
	RiBarChartLine as RiBChart,
	RiHome2Line as RiHome,
	RiNotification3Line as RiBell,
	RiSettings3Line as RiSettings,
} from "@remixicon/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	BarChart as HiChart,
	Bell as HiBell,
	Home as HiHome,
	Settings as HiSettings,
} from "@hugeicons/core-free-icons";

type IconProps = { className?: string };
type IconComponent = ComponentType<IconProps>;

type PreviewIconSet = {
	Home: IconComponent;
	Chart: IconComponent;
	Settings: IconComponent;
	Bell: IconComponent;
};

function hugeicon(
	iconData: ComponentProps<typeof HugeiconsIcon>["icon"],
): IconComponent {
	return function HugeWrap({ className }: IconProps) {
		return (
			<HugeiconsIcon
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				icon={iconData as any}
				className={className}
			/>
		);
	};
}

const ICON_SETS: Record<PresetConfig["iconLibrary"], PreviewIconSet> = {
	lucide: { Home: LuHome, Chart: LuChart, Settings: LuSettings, Bell: LuBell },
	tabler: { Home: TbHome, Chart: TbChart, Settings: TbSettings, Bell: TbBell },
	phosphor: {
		Home: PhHome,
		Chart: PhChart,
		Settings: PhSettings,
		Bell: PhBell,
	},
	remixicon: {
		Home: RiHome,
		Chart: RiBChart,
		Settings: RiSettings,
		Bell: RiBell,
	},
	hugeicons: {
		Home: hugeicon(HiHome),
		Chart: hugeicon(HiChart),
		Settings: hugeicon(HiSettings),
		Bell: hugeicon(HiBell),
	},
};

export function getPreviewIcons(
	library: PresetConfig["iconLibrary"],
): PreviewIconSet {
	return ICON_SETS[library] ?? ICON_SETS.lucide;
}
