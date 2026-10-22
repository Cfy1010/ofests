// Îlot de la liste à venir (ADR 0026) : filtre par pays, état dans l'URL.
// Rendu côté serveur : liste complète, contrôles absents. Les contrôles
// n'apparaissent qu'au montage, donc jamais sans JavaScript.
import { useEffect, useRef, useState } from "react";

import { interpolate } from "../i18n/interpolate.js";
import {
	filterEditions,
	parseCountryParam,
	serializeCountryParam,
	summarizeCountries,
} from "../lib/filters.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link";

// rows : lignes déjà formatées par UpcomingList.astro, avec countryCode
// countries : [{ code, label }], de availableCountries()
// labels : libellés de la langue de la page ; {count} reste à remplir ici
export default function UpcomingFilter({ rows, countries, labels, sortRule }) {
	const [mounted, setMounted] = useState(false);
	const [selected, setSelected] = useState([]);
	// Annonce aux lecteurs d'écran : posée seulement par une action du
	// visiteur, jamais au montage (sinon l'URL d'un lien partagé l'annonce)
	const [announcement, setAnnouncement] = useState("");
	const summaryRef = useRef(null);

	const codes = countries.map((country) => country.code);

	useEffect(() => {
		setSelected(parseCountryParam(window.location.search, codes));
		setMounted(true);
	}, []);

	// Le lien de l'autre langue reprend la query ; canonical et hreflang,
	// générés au build, restent sans query
	useEffect(() => {
		if (!mounted) return;
		for (const link of document.querySelectorAll("[data-language-link]")) {
			link.dataset.baseHref ??= link.getAttribute("href");
			link.setAttribute("href", link.dataset.baseHref + serializeCountryParam(window.location.search, selected));
		}
	}, [mounted, selected]);

	const visible = filterEditions(rows, { countries: selected });

	function select(next) {
		setSelected(next);
		const search = serializeCountryParam(window.location.search, next);
		window.history.replaceState(null, "", window.location.pathname + search + window.location.hash);
		setAnnouncement(resultsLabel(filterEditions(rows, { countries: next }).length));
	}

	function toggle(code) {
		select(
			selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code],
		);
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

	function reset() {
		select([]);
		// Le bouton disparaît : le focus revient au filtre
		summaryRef.current?.focus();
	}

	return (
		<>
			{mounted && (
				<details className="group mt-6 border border-line">
					<summary
						ref={summaryRef}
						className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 text-link [&::-webkit-details-marker]:hidden ${focusRing}`}
					>
						<span>{summaryLabel()}</span>
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
				</details>
			)}
			<div role="status" className="sr-only">
				{announcement}
			</div>
			<p className="mt-3 text-sm text-muted">{sortRule}</p>
			{mounted && selected.length > 0 && (
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
