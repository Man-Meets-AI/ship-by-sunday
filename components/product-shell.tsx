"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
	{ href: "/mission", label: "Mission" },
	{ href: "/artifacts", label: "Artifacts" },
	{ href: "/settings", label: "Settings" },
];

export function ProductShell({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<main className="min-h-screen bg-paper text-ink">
			<div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5">
				<header className="border border-line bg-white px-4 py-4 shadow-card sm:px-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-3">
							<Link
								href="/mission"
								className="inline-flex font-display text-3xl uppercase tracking-[0.08em]"
							>
								Ship by Sunday
							</Link>
							<nav className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink/65 sm:text-sm">
								{navItems.map((item) => {
									const isActive = pathname === item.href;

									return (
										<Link
											key={item.href}
											href={item.href}
											className={`border px-3 py-2 transition-colors ${
												isActive
													? "border-ink bg-ink text-paper"
													: "border-line bg-paper hover:bg-muted"
											}`}
										>
											{item.label}
										</Link>
									);
								})}
							</nav>
						</div>

						<div className="flex items-center justify-between gap-4 sm:justify-end">
							<div>
								<p className="font-display text-3xl uppercase leading-none tracking-[0.04em]">
									{title}
								</p>
								{subtitle ? (
									<p className="mt-1 max-w-md text-sm font-medium text-ink/70">
										{subtitle}
									</p>
								) : null}
							</div>
							<UserButton />
						</div>
					</div>
				</header>

				{children}
			</div>
		</main>
	);
}
