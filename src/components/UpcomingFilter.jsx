// Îlot de la liste à venir (ADR 0026) : filtres par pays et par période,
// état dans l'URL.
// Rendu côté serveur : liste complète, contrôles absents. Les contrôles
// n'apparaissent qu'au montage, donc jamais sans JavaScript.
import { forwardRef, useEffect, useRef, useState } from "react";

import { interpolate } from "../i18n/interpolate.js";
import {
	filterEditions,
	parseCountryParam,
	parsePeriodParam,
	serializeFilterParams,
	summarizeCountries,
	summarizePeriod,
} from "../lib/filters.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link";

// rows : lignes déjà formatées par UpcomingList.astro, avec countryCode
// countries : [{ code, label }], de availableCountries()
// months : [{ value, label, monthLabel }], de availableMonths()
// labels : libellés de la langue de la page ; {count} reste à remplir ici
const selectClass = `min-h-11 w-full border border-line bg-page px-2 text-body ${focusRing}`;

// Bloc repliable des filtres : résumé cliquable avec chevron
const Disclosure = forwardRef(function Disclosure({ summary, children }, summaryRef) {
	return (
		<details className="group mt-6 border border-line">
			<summary
				ref={summaryRef}
				className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-link [&::-webkit-details-marker]:hidden ${focusRing}`}
			>
				<span>{summary}</span>
				{/* Chevron : pivote à l'ouverture (group-open) */}
				<svg
					viewBox="0 0 24 24"
					width="20"
					height="20"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</summary>
			{children}
		</details>
	);
});

export default function UpcomingFilter({ rows, countries, months, labels, sortRule }) {
	const [mounted, setMounted] = useState(false);
	const [selected, setSelected] = useState([]);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	// Annonce aux lecteurs d'écran : posée seulement par une action du
	// visiteur, jamais au montage (sinon l'URL d'un lien partagé l'annonce)
	const [announcement, setAnnouncement] = useState("");
	const summaryRef = useRef(null);

	const codes = countries.map((country) => country.code);
	const monthValues = months.map((month) => month.value);

	useEffect(() => {
		setSelected(parseCountryParam(window.location.search, codes));
		const period = parsePeriodParam(window.location.search, monthValues);
		setFrom(period.from);
		setTo(period.to);
		setMounted(true);
	}, []);

	// Le lien de l'autre langue reprend la query ; canonical et hreflang,
	// générés au build, restent sans query
	useEffect(() => {
		if (!mounted) return;
		for (const link of document.querySelectorAll("[data-language-link]")) {
			link.dataset.baseHref ??= link.getAttribute("href");
			link.setAttribute("href", link.dataset.baseHref + serializeFilterParams(window.location.search, { countries: selected, from, to }));
		}
	}, [mounted, selected, from, to]);

	const visible = filterEditions(rows, { countries: selected, from, to });
	const filtered = selected.length > 0 || from !== "" || to !== "";

	// Applique les filtres, écrit l'URL et annonce le résultat. Une plage
	// inversée est corrigée : si « De » passe après « À », « À » prend « De ».
	function apply({ countries: nextCountries = selected, from: nextFrom = from, to: nextTo = to }) {
		if (nextFrom && nextTo && nextFrom > nextTo) nextTo = nextFrom;
		setSelected(nextCountries);
		setFrom(nextFrom);
		setTo(nextTo);
		const search = serializeFilterParams(window.location.search, {
			countries: nextCountries,
			from: nextFrom,
			to: nextTo,
		});
		window.history.replaceState(null, "", window.location.pathname + search + window.location.hash);
		const count = filterEditions(rows, { countries: nextCountries, from: nextFrom, to: nextTo }).length;
		setAnnouncement(resultsLabel(count));
	}

	function toggle(code) {
		apply({ countries: selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code] });
	}

	function resultsLabel(count) {
		return interpolate(count === 1 ? labels.resultsOne : labels.resultsOther, { count });
	}

	// « Pays » ; « Pays : Finlande » ; « Pays : Finlande, France +1 »
	function summaryLabel() {
		const { labels: shown, more } = summarizeCountries(countries, selected);
		if (shown.length === 0) return labels.country;
		const names = shown.join(", ");
		return interpolate(labels.countrySelected, {
			names: more > 0 ? interpolate(labels.countryMore, { names, count: more }) : names,
		});
	}

	// « Période » ; « Période : juin – août 2027 » ; « Période : à partir de juin 2027 »
	function periodSummaryLabel() {
		const summary = summarizePeriod(months, from, to);
		if (!summary) return labels.period;
		if (summary.kind === "from") return interpolate(labels.periodFrom, { month: summary.text });
		if (summary.kind === "to") return interpolate(labels.periodTo, { month: summary.text });
		return interpolate(labels.periodRange, { range: summary.text });
	}

	function reset() {
		apply({ countries: [], from: "", to: "" });
		// Le bouton disparaît : le focus revient au filtre
		summaryRef.current?.focus();
	}

	return (
		<>
			{mounted && (
				<Disclosure ref={summaryRef} summary={summaryLabel()}>
					<fieldset className="border-t border-line px-3 py-2">
						<legend className="sr-only">{labels.country}</legend>
						<ul className="grid gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
							{countries.map((country) => (
								<li key={country.code}>
									<label className="flex min-h-11 cursor-pointer items-center gap-3">
										<input
											type="checkbox"
											className={`size-5 accent-link ${focusRing}`}
											checked={selected.includes(country.code)}
											onChange={() => toggle(country.code)}
										/>
										{country.label}
									</label>
								</li>
							))}
						</ul>
					</fieldset>
				</Disclosure>
			)}
			{mounted && (
				<Disclosure summary={periodSummaryLabel()}>
					<fieldset className="grid gap-3 border-t border-line px-3 py-3 sm:grid-cols-2">
						<legend className="sr-only">{labels.period}</legend>
						<label className="grid gap-1">
							{labels.periodStart}
							<select className={selectClass} value={from} onChange={(event) => apply({ from: event.target.value })}>
								<option value="">{labels.anyMonth}</option>
								{months.map((month) => (
									<option key={month.value} value={month.value}>
										{month.label}
									</option>
								))}
							</select>
						</label>
						<label className="grid gap-1">
							{labels.periodEnd}
							<select className={selectClass} value={to} onChange={(event) => apply({ to: event.target.value })}>
								<option value="">{labels.anyMonth}</option>
								{months.map((month) => (
									<option key={month.value} value={month.value} disabled={from !== "" && month.value < from}>
										{month.label}
									</option>
								))}
							</select>
						</label>
					</fieldset>
				</Disclosure>
			)}
			<div role="status" className="sr-only">
				{announcement}
			</div>
			<p className="mt-3 text-sm text-muted">{sortRule}</p>
			{mounted && filtered && (
				<p className="mt-1 text-sm text-muted">{resultsLabel(visible.length)}</p>
			)}
			{visible.length === 0 ? (
				<div className="mt-6">
					<p>{labels.noResults}</p>
					<button
						type="button"
						className={`mt-3 min-h-11 border border-line px-4 text-link underline ${focusRing}`}
						onClick={reset}
					>
						{labels.reset}
					</button>
				</div>
			) : (
				<ul className="mt-6">
					{visible.map((row) => (
						<li
							key={row.id}
							className="border-t border-line py-4 sm:grid sm:grid-cols-[2fr_1.5fr_1.5fr_1fr] sm:items-baseline sm:gap-4"
						>
							{/* Lien vers la fiche (#5), dans la langue courante */}
							<h2 className="text-lg font-bold">
								<a className={`underline ${focusRing}`} href={row.href}>
									{row.name}
								</a>
							</h2>
							<p className="text-muted">{row.dates}</p>
							<p className="text-muted">{row.location}</p>
							<p className="text-muted">{row.genre}</p>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
