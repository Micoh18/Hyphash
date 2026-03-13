"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useObservations } from "@/hooks/useObservations";
import { useGeolocation } from "@/hooks/useGeolocation";
import { PhotoUpload } from "./PhotoUpload";
import type { LocalPhoto } from "./PhotoUpload";
import { useI18n } from "@/hooks/useI18n";
import { usePublishObservation } from "@/hooks/usePublishObservation";
import type { Observation, ObservationPhoto } from "@/types";
import type { TranslationKey } from "@/lib/i18n/translations/en";

const LocationPicker = dynamic(
  () =>
    import("./LocationPicker").then((mod) => mod.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 rounded-xl border border-[var(--border)] flex items-center justify-center bg-[var(--muted)]">
        <p className="text-sm text-[var(--muted-foreground)]">Loading map...</p>
      </div>
    ),
  }
);
import {
  CAP_SHAPES,
  CAP_SURFACES,
  SUBSTRATES,
  HABITATS,
  SMELLS,
  CAP_MARGINS,
  GILL_ATTACHMENTS,
  GILL_SPACINGS,
  STEM_SHAPES,
  STEM_SURFACES,
  STEM_BASES,
  FLESH_CONSISTENCIES,
  COLOR_CHANGES,
  TASTES,
  ECOLOGICAL_ROLES,
  SEASONS,
} from "@/types";

type Step = "location" | "appearance" | "environment" | "identification" | "photos";

const STEPS: { key: Step; labelKey: TranslationKey }[] = [
  { key: "location", labelKey: "form.step_location" },
  { key: "photos", labelKey: "form.step_photos" },
  { key: "appearance", labelKey: "form.step_appearance" },
  { key: "environment", labelKey: "form.step_environment" },
  { key: "identification", labelKey: "form.step_id_notes" },
];

function InfoTip({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const key = `info.${term}` as TranslationKey;
  const info = t(key);
  if (!info || info === key) return null;

  return (
    <span className="relative inline-block ml-1.5 align-middle" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold leading-none transition-colors ${
          open
            ? "bg-emerald-600 text-white"
            : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-emerald-100 hover:text-emerald-700"
        }`}
        aria-label={`Info about ${term}`}
      >
        ?
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 w-64 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 shadow-lg animate-in fade-in slide-in-from-top-1">
          {info}
        </div>
      )}
    </span>
  );
}

export function ObservationForm() {
  const router = useRouter();
  const { connected, address, profile, error: walletError, connect } = useWallet();
  const { addObservation } = useObservations();
  const { t } = useI18n();
  const geo = useGeolocation();
  const { step: publishStep, publish, error: publishError } = usePublishObservation();

  const [step, setStep] = useState<Step>("location");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [publishOnChain, setPublishOnChain] = useState(false);

  // Location state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [radius, setRadius] = useState(250);
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);

  // Form state — the actual pin position (defaults to GPS, refined via map)
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [observedAt, setObservedAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [capShape, setCapShape] = useState("");
  const [capColor, setCapColor] = useState("");
  const [capSizeCm, setCapSizeCm] = useState<string>("");
  const [capSurface, setCapSurface] = useState("");
  const [undersideType, setUndersideType] = useState("");
  const [undersideColor, setUndersideColor] = useState("");
  const [stemColor, setStemColor] = useState("");
  const [stemHeightCm, setStemHeightCm] = useState<string>("");
  const [stemHollow, setStemHollow] = useState<boolean | null>(null);
  const [stemRing, setStemRing] = useState<boolean | null>(null);
  const [fleshColor, setFleshColor] = useState("");
  const [bruiseColor, setBruiseColor] = useState("");
  const [smell, setSmell] = useState("");
  const [substrate, setSubstrate] = useState("");
  const [habitat, setHabitat] = useState("");
  const [growthPattern, setGrowthPattern] = useState("");
  const [sporePrintColor, setSporePrintColor] = useState("");
  const [proposedSpecies, setProposedSpecies] = useState("");
  const [confidence, setConfidence] = useState("");
  const [notes, setNotes] = useState("");

  // Advanced fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [capMargin, setCapMargin] = useState("");
  const [gillAttachment, setGillAttachment] = useState("");
  const [gillSpacing, setGillSpacing] = useState("");
  const [stemShape, setStemShape] = useState("");
  const [stemSurface, setStemSurface] = useState("");
  const [stemBase, setStemBase] = useState("");
  const [hasVolva, setHasVolva] = useState<boolean | null>(null);
  const [fleshConsistency, setFleshConsistency] = useState("");
  const [colorChange, setColorChange] = useState("");
  const [hasLatex, setHasLatex] = useState<boolean | null>(null);
  const [latexColor, setLatexColor] = useState("");
  const [taste, setTaste] = useState("");
  const [ecologicalRole, setEcologicalRole] = useState("");
  const [associatedTrees, setAssociatedTrees] = useState("");
  const [season, setSeason] = useState("");

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const handleUseGPS = () => {
    geo.locate();
  };

  // Auto-fill GPS when it arrives
  if (geo.latitude && geo.longitude && gpsLat === null && gpsLng === null) {
    setGpsLat(geo.latitude);
    setGpsLng(geo.longitude);
    setLat(geo.latitude);
    setLng(geo.longitude);
  }

  const handleSubmit = async () => {
    if (!lat || !lng) return;

    const id = `obs-${Date.now()}`;
    const observation: Observation = {
      id,
      observer_id: profile?.id ?? "anonymous",
      location: { lat, lng },
      latitude: lat,
      longitude: lng,
      observed_at: observedAt,
      cap_shape: capShape || null,
      cap_color: capColor || null,
      cap_size_cm: capSizeCm ? parseFloat(capSizeCm) : null,
      cap_surface: capSurface || null,
      underside_type: (undersideType as Observation["underside_type"]) || null,
      underside_color: undersideColor || null,
      underside_spacing: null,
      gill_attachment: null,
      stem_color: stemColor || null,
      stem_height_cm: stemHeightCm ? parseFloat(stemHeightCm) : null,
      stem_hollow: stemHollow,
      stem_ring: stemRing,
      flesh_color: fleshColor || null,
      bruise_color: bruiseColor || null,
      smell: smell || null,
      cap_margin: capMargin || null,
      stem_shape: stemShape || null,
      stem_surface: stemSurface || null,
      stem_base: stemBase || null,
      has_volva: hasVolva,
      flesh_consistency: fleshConsistency || null,
      color_change: colorChange || null,
      has_latex: hasLatex,
      latex_color: latexColor || null,
      taste: taste || null,
      substrate: substrate || null,
      habitat: habitat || null,
      growth_pattern: (growthPattern as Observation["growth_pattern"]) || null,
      ecological_role: ecologicalRole || null,
      associated_trees: associatedTrees || null,
      season: season || null,
      spore_print_color: sporePrintColor || null,
      proposed_species: proposedSpecies || null,
      confidence: (confidence as Observation["confidence"]) || null,
      notes: notes || null,
      status: "unverified",
      verified_species: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      photos: photos.map(
        (p, i): ObservationPhoto => ({
          id: `ph-${Date.now()}-${i}`,
          observation_id: id,
          storage_path: p.preview,
          photo_type: p.type,
          sort_order: i,
          created_at: new Date().toISOString(),
        })
      ),
      observer: profile ?? undefined,
    };

    addObservation(observation);

    // Publish to IPFS + Stellar if opted in
    if (publishOnChain && connected && address) {
      const validPhotos = photos.filter((p) => p.validationStatus !== "invalid");
      publish({
        observationId: id,
        observerAddress: address,
        species: proposedSpecies || null,
        location: { lat, lng },
        observedAt,
        notes: notes || null,
        photos: validPhotos.map((p) => p.file),
      });
    }

    router.push("/map");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--card)]/90 backdrop-blur border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/map")}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {t("common.back")}
          </button>
          <h1 className="font-semibold text-[var(--foreground)]">
            {t("form.new_observation")}
          </h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= currentStepIndex ? "bg-emerald-500" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEPS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`text-[10px] ${
                step === s.key
                  ? "text-emerald-600 font-medium"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              {t(s.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {!connected && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <p className="font-medium mb-2">{t("form.connect_wallet_alert")}</p>
            <button
              onClick={connect}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
            >
              {t("nav.connect_wallet")}
            </button>
            {walletError && (
              <p className="mt-2 text-xs text-red-600">{walletError}</p>
            )}
          </div>
        )}

        {step === "location" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                {t("form.date_observed")}
              </label>
              <input
                type="date"
                value={observedAt}
                onChange={(e) => setObservedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t("form.location")}
              </label>

              {/* Step 1: Get GPS */}
              <button
                onClick={handleUseGPS}
                disabled={geo.loading}
                className="w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium hover:bg-emerald-100 disabled:opacity-50 mb-2"
              >
                {geo.loading
                  ? t("form.getting_location")
                  : gpsLat !== null
                  ? `📍 ${t("form.gps_coordinates", { lat: gpsLat.toFixed(5), lng: gpsLng!.toFixed(5) })}`
                  : `📍 ${t("form.get_gps")}`}
              </button>
              {geo.error && (
                <p className="text-xs text-red-500 mb-2">{geo.error}</p>
              )}

              {/* Step 2: Refine on map (only after GPS) */}
              {gpsLat !== null && gpsLng !== null && (
                <>
                  <button
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors mb-3 ${
                      showMapPicker
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    🗺️ {showMapPicker ? t("form.hide_map") : t("form.refine_on_map")}
                  </button>

                  {showMapPicker && (
                    <div className="mb-3">
                      <LocationPicker
                        gpsLat={gpsLat}
                        gpsLng={gpsLng}
                        pinLat={lat}
                        pinLng={lng}
                        radius={radius}
                        onPinChange={(newLat, newLng) => {
                          setLat(newLat);
                          setLng(newLng);
                        }}
                        onRadiusChange={setRadius}
                      />
                    </div>
                  )}

                  {/* Show final pin coordinates */}
                  {lat !== null && lng !== null && (
                    <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                      📍 {t("form.pin_coordinates", { lat: lat.toFixed(5), lng: lng.toFixed(5) })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {step === "photos" && (
          <PhotoUpload photos={photos} setPhotos={setPhotos} />
        )}

        {step === "appearance" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {t("form.cap")} <InfoTip term="cap" />
            </h2>
            <SelectField label={t("form.shape")} value={capShape} onChange={setCapShape} options={[...CAP_SHAPES]} info="cap_shape" optionPrefix="cap_shape" />
            <TextField label={t("form.color")} value={capColor} onChange={setCapColor} placeholder={t("form.color_placeholder")} />
            <TextField label={t("form.size_cm")} value={capSizeCm} onChange={setCapSizeCm} placeholder={t("form.size_placeholder")} type="number" info="cap_size" />
            <SelectField label={t("form.surface")} value={capSurface} onChange={setCapSurface} options={[...CAP_SURFACES]} info="cap_surface" optionPrefix="cap_surface" />

            <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">
              {t("form.underside")} <InfoTip term="underside" />
            </h2>
            <SelectField label={t("form.type")} value={undersideType} onChange={setUndersideType} options={["gills", "pores", "teeth", "smooth"]} info="underside_type" optionPrefix="underside" />
            <TextField label={t("form.color")} value={undersideColor} onChange={setUndersideColor} placeholder={t("form.underside_color_placeholder")} />

            <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">
              {t("form.stem")} <InfoTip term="stem" />
            </h2>
            <TextField label={t("form.color")} value={stemColor} onChange={setStemColor} placeholder={t("form.stem_color_placeholder")} />
            <TextField label={t("form.height_cm")} value={stemHeightCm} onChange={setStemHeightCm} placeholder={t("form.height_placeholder")} type="number" />
            <BooleanField label={t("form.hollow")} value={stemHollow} onChange={setStemHollow} info="stem_hollow" />
            <BooleanField label={t("form.ring_present")} value={stemRing} onChange={setStemRing} info="stem_ring" />

            <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">
              {t("form.flesh")} <InfoTip term="flesh" />
            </h2>
            <TextField label={t("form.flesh_color")} value={fleshColor} onChange={setFleshColor} placeholder={t("form.flesh_color_placeholder")} />
            <TextField label={t("form.bruise_color")} value={bruiseColor} onChange={setBruiseColor} placeholder={t("form.bruise_color_placeholder")} info="bruise_color" />

            <h2 className="text-lg font-semibold text-[var(--foreground)] pt-2">
              {t("form.smell")} <InfoTip term="smell_section" />
            </h2>
            <SelectField label={t("form.smell")} value={smell} onChange={setSmell} options={[...SMELLS]} optionPrefix="smell" />

            {/* Advanced appearance toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full mt-4 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                showAdvanced
                  ? "bg-violet-50 border-violet-300 text-violet-700"
                  : "bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {showAdvanced ? "▾" : "▸"} {t("form.advanced_toggle")}
              <span className="block text-xs font-normal opacity-70 mt-0.5">{t("form.advanced_hint")}</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-2 pl-3 border-l-2 border-violet-200">
                <h3 className="text-sm font-semibold text-violet-700">{t("form.cap")} — {t("form.advanced_toggle")}</h3>
                <SelectField label={t("form.cap_margin")} value={capMargin} onChange={setCapMargin} options={[...CAP_MARGINS]} info="cap_margin" optionPrefix="cap_margin" />

                <h3 className="text-sm font-semibold text-violet-700 pt-2">{t("form.underside")} — {t("form.advanced_toggle")}</h3>
                <SelectField label={t("form.gill_attachment")} value={gillAttachment} onChange={setGillAttachment} options={[...GILL_ATTACHMENTS]} info="gill_attachment" optionPrefix="gill_attachment" />
                <SelectField label={t("form.gill_spacing")} value={gillSpacing} onChange={setGillSpacing} options={[...GILL_SPACINGS]} info="gill_spacing" optionPrefix="gill_spacing" />

                <h3 className="text-sm font-semibold text-violet-700 pt-2">{t("form.stem")} — {t("form.advanced_toggle")}</h3>
                <SelectField label={t("form.stem_shape")} value={stemShape} onChange={setStemShape} options={[...STEM_SHAPES]} info="stem_shape" optionPrefix="stem_shape" />
                <SelectField label={t("form.stem_surface")} value={stemSurface} onChange={setStemSurface} options={[...STEM_SURFACES]} info="stem_surface" optionPrefix="stem_surface" />
                <SelectField label={t("form.stem_base")} value={stemBase} onChange={setStemBase} options={[...STEM_BASES]} info="stem_base" optionPrefix="stem_base" />
                <BooleanField label={t("form.has_volva")} value={hasVolva} onChange={setHasVolva} info="has_volva" />

                <h3 className="text-sm font-semibold text-violet-700 pt-2">{t("form.flesh")} — {t("form.advanced_toggle")}</h3>
                <SelectField label={t("form.flesh_consistency")} value={fleshConsistency} onChange={setFleshConsistency} options={[...FLESH_CONSISTENCIES]} info="flesh_consistency" optionPrefix="flesh_consistency" />
                <SelectField label={t("form.color_change")} value={colorChange} onChange={setColorChange} options={[...COLOR_CHANGES]} info="color_change" optionPrefix="color_change" />
                <BooleanField label={t("form.has_latex")} value={hasLatex} onChange={setHasLatex} info="has_latex" />
                {hasLatex && (
                  <TextField label={t("form.latex_color")} value={latexColor} onChange={setLatexColor} placeholder={t("form.latex_color_placeholder")} />
                )}

                <div className="pt-2">
                  <SelectField label={t("form.taste")} value={taste} onChange={setTaste} options={[...TASTES]} info="taste" optionPrefix="taste" />
                  <p className="text-xs text-amber-600 mt-1">{t("form.taste_warning")}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "environment" && (
          <div className="space-y-4">
            <SelectField label={t("form.substrate")} value={substrate} onChange={setSubstrate} options={[...SUBSTRATES]} info="substrate" optionPrefix="substrate" />
            <SelectField label={t("form.habitat")} value={habitat} onChange={setHabitat} options={[...HABITATS]} info="habitat" optionPrefix="habitat" />
            <SelectField label={t("form.growth_pattern")} value={growthPattern} onChange={setGrowthPattern} options={["alone", "cluster", "ring", "scattered"]} info="growth_pattern" optionPrefix="growth" />
            <TextField label={t("form.spore_print_color")} value={sporePrintColor} onChange={setSporePrintColor} placeholder={t("form.spore_print_placeholder")} info="spore_print" />

            {showAdvanced && (
              <div className="space-y-4 pt-2 pl-3 border-l-2 border-violet-200 mt-4">
                <h3 className="text-sm font-semibold text-violet-700">{t("form.step_environment")} — {t("form.advanced_toggle")}</h3>
                <SelectField label={t("form.ecological_role")} value={ecologicalRole} onChange={setEcologicalRole} options={[...ECOLOGICAL_ROLES]} info="ecological_role" optionPrefix="ecological_role" />
                <TextField label={t("form.associated_trees")} value={associatedTrees} onChange={setAssociatedTrees} placeholder={t("form.associated_trees_placeholder")} />
                <SelectField label={t("form.season")} value={season} onChange={setSeason} options={[...SEASONS]} info="season" optionPrefix="season" />
              </div>
            )}
          </div>
        )}

        {step === "identification" && (
          <div className="space-y-4">
            <TextField label={t("form.proposed_species")} value={proposedSpecies} onChange={setProposedSpecies} placeholder={t("form.proposed_species_placeholder")} />
            <SelectField label={t("form.confidence")} value={confidence} onChange={setConfidence} options={["no_idea", "guess", "somewhat", "pretty_sure"]} optionPrefix="confidence" />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                {t("form.notes")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("form.notes_placeholder")}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm resize-none"
              />
            </div>

            {/* Publish on-chain toggle */}
            {connected && photos.length > 0 && (
              <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] cursor-pointer hover:border-violet-300 transition-colors">
                <input
                  type="checkbox"
                  checked={publishOnChain}
                  onChange={(e) => setPublishOnChain(e.target.checked)}
                  className="mt-0.5 accent-violet-600"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {t("publish.toggle_label")}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {t("publish.toggle_description")}
                  </p>
                </div>
              </label>
            )}

            {publishStep !== "idle" && publishStep !== "done" && (
              <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-sm text-violet-700">
                {publishStep === "uploading_ipfs" && t("publish.uploading_ipfs")}
                {publishStep === "minting_nft" && t("publish.minting_nft")}
                {publishStep === "signing" && t("publish.signing")}
                {publishStep === "error" && (
                  <span className="text-red-600">{publishError}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => {
              const prev = STEPS[currentStepIndex - 1];
              if (prev) setStep(prev.key);
            }}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
          >
            {t("form.previous")}
          </button>

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(STEPS[currentStepIndex + 1].key)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              {t("form.next")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!lat || !lng || photos.some((p) => p.validationStatus === "invalid" || p.validationStatus === "validating")}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {t("form.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  info,
  optionPrefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  info?: string;
  optionPrefix?: string;
}) {
  const { t } = useI18n();
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
        {label}
        {info && <InfoTip term={info} />}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
      >
        <option value="">{t("common.select")}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {optionPrefix ? t(`${optionPrefix}.${o}` as TranslationKey) : o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  info,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  info?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
        {label}
        {info && <InfoTip term={info} />}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-sm"
      />
    </div>
  );
}

function BooleanField({
  label,
  value,
  onChange,
  info,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  info?: string;
}) {
  const { t } = useI18n();
  const options: { label: string; val: boolean | null }[] = [
    { label: t("common.yes"), val: true },
    { label: t("common.no"), val: false },
    { label: t("common.not_sure"), val: null },
  ];
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
        {label}
        {info && <InfoTip term={info} />}
      </label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange(opt.val)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              value === opt.val
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
