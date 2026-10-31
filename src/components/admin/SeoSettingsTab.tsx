"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Globe,
  FileCode,
  FileText,
  Map,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Upload,
  RefreshCw,
  ExternalLink,
  Eye,
  Copy,
  Check,
  ShieldAlert,
  Info,
  Sliders,
  Sparkles,
} from "lucide-react";

interface PublicPageDef {
  path: string;
  name: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultPriority: number;
  defaultChangefreq: string;
}

interface PageSeoData {
  path: string;
  title: string;
  description: string;
  share_image: string;
  canonical_override: string;
  noindex: boolean;
}

interface GlobalSeoData {
  site_name: string;
  title_template: string;
  default_meta_description: string;
  default_share_image: string;
  canonical_base_url: string;
  favicon: string;
}

interface SitemapPageConfig {
  included: boolean;
  changefreq: string;
  priority: number;
}

export function SeoSettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState<"global" | "pages" | "robots" | "sitemap">("global");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Global SEO state
  const [globalSeo, setGlobalSeo] = useState<GlobalSeoData>({
    site_name: "SS International Courier",
    title_template: "%s | SS International Courier",
    default_meta_description: "",
    default_share_image: "/images/ss-logo.jpg",
    canonical_base_url: "https://ssinternationalcourier.com",
    favicon: "/favicon.ico",
  });

  // Pages SEO state
  const [publicPages, setPublicPages] = useState<PublicPageDef[]>([]);
  const [pagesSeo, setPagesSeo] = useState<Record<string, PageSeoData>>({});
  const [selectedPagePath, setSelectedPagePath] = useState<string>("/");

  // Robots.txt state
  const [robotsContent, setRobotsContent] = useState<string>("");
  const [robotsPreviewOpen, setRobotsPreviewOpen] = useState(false);

  // Sitemap state
  const [sitemapPages, setSitemapPages] = useState<Record<string, SitemapPageConfig>>({});
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  // File upload state
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Load SEO config from API
  const loadSeoConfig = async () => {
    setIsLoading(true);
    setSaveStatus(null);
    try {
      const res = await fetch("/api/admin/settings/seo");
      if (!res.ok) throw new Error("Failed to load SEO configuration");
      const data = await res.json();

      if (data.global) setGlobalSeo(data.global);
      if (data.pages) setPagesSeo(data.pages);
      if (data.publicPages) setPublicPages(data.publicPages);
      if (data.robots?.content) setRobotsContent(data.robots.content);
      if (data.sitemap?.pages) setSitemapPages(data.sitemap.pages);
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "Failed to load SEO settings" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeoConfig();
  }, []);

  // Handle image upload
  const handleFileUpload = async (file: File, target: "global_share" | "global_favicon" | "page_share") => {
    setUploadingTarget(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (target === "global_share") {
        setGlobalSeo((prev) => ({ ...prev, default_share_image: data.url }));
      } else if (target === "global_favicon") {
        setGlobalSeo((prev) => ({ ...prev, favicon: data.url }));
      } else if (target === "page_share") {
        setPagesSeo((prev) => ({
          ...prev,
          [selectedPagePath]: {
            ...prev[selectedPagePath],
            share_image: data.url,
          },
        }));
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploadingTarget(null);
    }
  };

  // Save specific section
  const handleSave = async (section: "global" | "pages" | "robots" | "sitemap") => {
    setIsSaving(true);
    setSaveStatus(null);

    // Validation for robots.txt "Disallow: /"
    if (section === "robots" && /^\s*Disallow:\s*\/\s*$/m.test(robotsContent)) {
      const confirmed = window.confirm(
        "CRITICAL WARNING:\n\nYour robots.txt contains 'Disallow: /' which completely blocks your entire website from Google, Bing, and all search engines!\n\nAre you sure you want to proceed?"
      );
      if (!confirmed) {
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload: any = { section };
      if (section === "global") payload.global = globalSeo;
      if (section === "pages") payload.pages = pagesSeo;
      if (section === "robots") payload.robots = { content: robotsContent };
      if (section === "sitemap") payload.sitemap = { pages: sitemapPages };

      const res = await fetch("/api/admin/settings/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SEO settings");

      setSaveStatus({
        success: true,
        message: `${
          section === "global"
            ? "Global SEO"
            : section === "pages"
            ? "Per-Page SEO"
            : section === "robots"
            ? "Robots.txt"
            : "Sitemap.xml"
        } saved successfully. Cache revalidated across all live public pages.`,
      });
    } catch (err: any) {
      setSaveStatus({ success: false, message: err.message || "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset robots.txt to safe default
  const handleResetRobots = () => {
    const cleanBase = (globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "");
    const safeDefault = `# SS International Courier - Robots Exclusion Protocol\nUser-agent: *\nAllow: /\n\n# Protected Admin, Internal API & Authenticated Customer Portals\nDisallow: /admin\nDisallow: /admin/\nDisallow: /api\nDisallow: /api/\nDisallow: /customer\nDisallow: /customer/\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /track/*\n\n# Sitemap Index\nSitemap: ${cleanBase}/sitemap.xml\n`;
    setRobotsContent(safeDefault);
  };

  // Copy sitemap URL
  const handleCopySitemapUrl = () => {
    const cleanBase = (globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "");
    navigator.clipboard.writeText(`${cleanBase}/sitemap.xml`);
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 2000);
  };

  // Selected page data helper
  const currentPageSeo = pagesSeo[selectedPagePath] || {
    path: selectedPagePath,
    title: "",
    description: "",
    share_image: "",
    canonical_override: "",
    noindex: false,
  };

  const updateCurrentPage = (fields: Partial<PageSeoData>) => {
    setPagesSeo((prev) => ({
      ...prev,
      [selectedPagePath]: {
        ...currentPageSeo,
        ...fields,
        path: selectedPagePath,
      },
    }));
  };

  // Google Preview Computed Values
  const previewTitle = currentPageSeo.title.trim()
    ? globalSeo.title_template.includes("%s")
      ? globalSeo.title_template.replace("%s", currentPageSeo.title.trim())
      : `${currentPageSeo.title.trim()} | ${globalSeo.site_name}`
    : globalSeo.site_name;

  const previewDescription =
    currentPageSeo.description.trim() || globalSeo.default_meta_description || "No description provided.";

  const previewCanonical =
    currentPageSeo.canonical_override.trim() ||
    `${(globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "")}${
      selectedPagePath === "/" ? "" : selectedPagePath
    }`;

  const cleanBaseDomain = (globalSeo.canonical_base_url || "https://ssinternationalcourier.com")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  const hasDangerousDisallow = /^\s*Disallow:\s*\/\s*$/m.test(robotsContent);

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
        <p className="text-xs text-text-secondary">Loading SEO management suite…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Sub-tab Navigation */}
      <div className="border-b border-border-default pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-accent" />
              <h2 className="text-base font-bold text-text-primary">SEO &amp; Search Engine Optimization</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Configure global tags, per-page meta descriptions, robots.txt, and XML sitemaps with zero-delay cache revalidation.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadSeoConfig} disabled={isLoading || isSaving}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("global");
              setSaveStatus(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSubTab === "global"
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Global SEO Settings</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("pages");
              setSaveStatus(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSubTab === "pages"
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Per-Page SEO</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("robots");
              setSaveStatus(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSubTab === "robots"
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Robots.txt</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("sitemap");
              setSaveStatus(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSubTab === "sitemap"
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-surface-subtle text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Sitemap.xml</span>
          </button>
        </div>
      </div>

      {/* Save Notification Alert */}
      {saveStatus && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in-50 ${
            saveStatus.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {saveStatus.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{saveStatus.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. GLOBAL SEO SETTINGS                                                    */}
      {/* ========================================================================= */}
      {activeSubTab === "global" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Site Name */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Site Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={globalSeo.site_name}
                onChange={(e) => setGlobalSeo({ ...globalSeo, site_name: e.target.value })}
                placeholder="e.g. SS International Courier"
              />
              <p className="text-[11px] text-text-muted mt-1">Default site brand name used in metadata tags.</p>
            </div>

            {/* Title Template */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-text-primary">
                  Title Template <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-text-muted font-mono">{globalSeo.title_template.length} / ~60</span>
              </div>
              <Input
                value={globalSeo.title_template}
                onChange={(e) => setGlobalSeo({ ...globalSeo, title_template: e.target.value })}
                placeholder="e.g. %s | SS Courier Service"
              />
              <p className="text-[11px] text-text-muted mt-1">Use %s where individual page titles should appear.</p>
            </div>

            {/* Canonical Base URL */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Canonical Base URL <span className="text-rose-500">*</span>
              </label>
              <Input
                value={globalSeo.canonical_base_url}
                onChange={(e) => setGlobalSeo({ ...globalSeo, canonical_base_url: e.target.value })}
                placeholder="https://ssinternationalcourier.com"
              />
              <p className="text-[11px] text-text-muted mt-1">
                Primary production domain. Used for canonical URLs, sitemaps, and OpenGraph images.
              </p>
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Favicon (.ico or .png)</label>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={globalSeo.favicon || "/favicon.ico"}
                  alt="Favicon preview"
                  className="w-8 h-8 rounded border border-border-default object-contain bg-slate-50 p-1 shrink-0"
                  onError={(e) => ((e.target as any).src = "/favicon.ico")}
                />
                <Input
                  value={globalSeo.favicon}
                  onChange={(e) => setGlobalSeo({ ...globalSeo, favicon: e.target.value })}
                  placeholder="/favicon.ico or https://..."
                  className="flex-1"
                />
                <label className="cursor-pointer shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-border-default bg-surface-subtle hover:bg-slate-200 text-text-primary transition-colors">
                    {uploadingTarget === "global_favicon" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>Upload</span>
                  </span>
                  <input
                    type="file"
                    accept=".ico,.png,.svg"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "global_favicon");
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Default Meta Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-text-primary">
                Default Meta Description <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  globalSeo.default_meta_description.length > 160
                    ? "text-amber-600"
                    : globalSeo.default_meta_description.length >= 120
                    ? "text-emerald-600"
                    : "text-text-muted"
                }`}
              >
                {globalSeo.default_meta_description.length} / ~155 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={globalSeo.default_meta_description}
              onChange={(e) => setGlobalSeo({ ...globalSeo, default_meta_description: e.target.value })}
              placeholder="Fallback meta description shown in search results when a specific page has none specified."
              className="w-full text-xs p-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Default Share Image */}
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">Default Social Share Image (OG Image)</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={globalSeo.default_share_image || "/images/ss-logo.jpg"}
                alt="OG preview"
                className="w-24 h-14 rounded-lg border border-border-default object-cover bg-slate-100 shrink-0"
              />
              <div className="flex-1 w-full space-y-1.5">
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={globalSeo.default_share_image}
                    onChange={(e) => setGlobalSeo({ ...globalSeo, default_share_image: e.target.value })}
                    placeholder="/images/ss-logo.jpg or full URL"
                    className="flex-1"
                  />
                  <label className="cursor-pointer shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-border-default bg-surface-subtle hover:bg-slate-200 text-text-primary transition-colors">
                      {uploadingTarget === "global_share" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "global_share");
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-text-muted">Recommended dimension: 1200 × 630 px (JPG or PNG).</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-border-default flex justify-end">
            <Button onClick={() => handleSave("global")} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Global SEO Settings
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PER-PAGE SEO SETTINGS                                                  */}
      {/* ========================================================================= */}
      {activeSubTab === "pages" && (
        <div className="space-y-6">
          {/* Page Selector Strip */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">Select Public Page to Configure:</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {publicPages.map((page) => {
                const isSelected = selectedPagePath === page.path;
                const pageData = pagesSeo[page.path];
                const isNoIndex = pageData?.noindex;
                return (
                  <button
                    key={page.path}
                    type="button"
                    onClick={() => setSelectedPagePath(page.path)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#06122C] text-[#C58B24] border border-[#C58B24]/40 shadow-xs"
                        : "bg-white border border-border-default text-text-secondary hover:bg-slate-50"
                    }`}
                  >
                    <span>{page.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">{page.path}</span>
                    {isNoIndex && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Hide from search engines (noindex)" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields for Selected Page */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Edit Inputs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Page Title */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-text-primary">Page Title</label>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      currentPageSeo.title.length > 60 ? "text-amber-600" : "text-text-muted"
                    }`}
                  >
                    {currentPageSeo.title.length} / ~60 chars
                  </span>
                </div>
                <Input
                  value={currentPageSeo.title}
                  onChange={(e) => updateCurrentPage({ title: e.target.value })}
                  placeholder="e.g. Worldwide Express Courier Services"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Leave empty to inherit fallback default for this route.
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-text-primary">Meta Description</label>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      currentPageSeo.description.length > 160
                        ? "text-amber-600"
                        : currentPageSeo.description.length >= 120
                        ? "text-emerald-600"
                        : "text-text-muted"
                    }`}
                  >
                    {currentPageSeo.description.length} / ~155 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={currentPageSeo.description}
                  onChange={(e) => updateCurrentPage({ description: e.target.value })}
                  placeholder="Compelling description to attract searchers. Falls back to global default if empty."
                  className="w-full text-xs p-3 rounded-xl border border-border-default bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Canonical Override */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Canonical URL Override</label>
                <Input
                  value={currentPageSeo.canonical_override}
                  onChange={(e) => updateCurrentPage({ canonical_override: e.target.value })}
                  placeholder={`Default: ${(globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(
                    /\/+$/,
                    ""
                  )}${selectedPagePath === "/" ? "" : selectedPagePath}`}
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Specify an alternate canonical URL if this page consolidates duplicate content.
                </p>
              </div>

              {/* Share Image Override */}
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Page Share Image (OG Image)</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={currentPageSeo.share_image}
                    onChange={(e) => updateCurrentPage({ share_image: e.target.value })}
                    placeholder="Leave blank to use default global share image"
                    className="flex-1"
                  />
                  <label className="cursor-pointer shrink-0">
                    <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-border-default bg-surface-subtle hover:bg-slate-200 text-text-primary transition-colors">
                      {uploadingTarget === "page_share" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, "page_share");
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Noindex Toggle */}
              <div className="pt-2 border-t border-border-default">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={Boolean(currentPageSeo.noindex)}
                    onChange={(e) => updateCurrentPage({ noindex: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <div>
                    <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <span>Hide from search engines (noindex, nofollow)</span>
                      {currentPageSeo.noindex && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold uppercase">
                          Noindex Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Tells crawlers not to index this page and excludes it automatically from sitemap.xml.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Right 5 cols: Google-Style Search Result Live Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Eye className="w-4 h-4 text-brand-primary" />
                  <span>Google Search Preview</span>
                </div>
                <span className="text-[10px] text-text-muted">Live Desktop Preview</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                {/* Google Snippet Top: Favicon + Breadcrumb */}
                <div className="flex items-center gap-2 text-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={globalSeo.favicon || "/favicon.ico"}
                    alt="Favicon"
                    className="w-4 h-4 rounded-full object-contain shrink-0"
                    onError={(e) => ((e.target as any).src = "/favicon.ico")}
                  />
                  <div className="min-w-0">
                    <div className="text-[12px] text-slate-800 font-medium leading-none truncate">
                      {globalSeo.site_name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono leading-none truncate mt-0.5">
                      {cleanBaseDomain} {selectedPagePath === "/" ? "" : `› ${selectedPagePath.replace(/^\//, "")}`}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug line-clamp-2">
                  {previewTitle}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">{previewDescription}</p>

                {/* Noindex banner if checked */}
                {currentPageSeo.noindex && (
                  <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>⚠️ Warning: Page marked NOINDEX (Hidden from Google).</span>
                  </div>
                )}
              </div>

              {/* Share image preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Active Share Image Preview
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPageSeo.share_image || globalSeo.default_share_image || "/images/ss-logo.jpg"}
                  alt="Share Preview"
                  className="w-full h-32 object-cover rounded-lg border border-slate-200"
                />
                <span className="text-[10px] text-text-muted block truncate">
                  {currentPageSeo.share_image || globalSeo.default_share_image || "/images/ss-logo.jpg"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-border-default flex justify-end">
            <Button onClick={() => handleSave("pages")} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save All Per-Page SEO Settings
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ROBOTS.TXT (EDITABLE WITH LIVE PREVIEW)                                */}
      {/* ========================================================================= */}
      {activeSubTab === "robots" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Robots Exclusion Protocol (/robots.txt)</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Served dynamically at <code className="font-mono text-brand-primary">/robots.txt</code>. Safe default blocks
                sensitive portals and private tracking tokens.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetRobots} type="button">
                Reset to Default
              </Button>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-default bg-surface-subtle hover:bg-slate-200 text-xs font-semibold text-text-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live /robots.txt</span>
              </a>
            </div>
          </div>

          {/* Dangerous Disallow Warning */}
          {hasDangerousDisallow && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-900 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-800">Critical Warning: Entire Site Blocked!</h4>
                <p className="mt-1 leading-relaxed">
                  Your robots.txt includes <code>Disallow: /</code> which instructs Google, Bing, and all web crawlers to
                  de-index your entire site. Remove this line unless you intentionally wish to hide the website.
                </p>
              </div>
            </div>
          )}

          {/* Text Editor */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted px-1">
              <span>Robots.txt Source Code</span>
              <span className="font-mono">{robotsContent.split("\n").length} lines</span>
            </div>
            <textarea
              rows={12}
              value={robotsContent}
              onChange={(e) => setRobotsContent(e.target.value)}
              className="w-full font-mono text-xs p-4 rounded-xl border border-border-default bg-slate-950 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-brand-primary leading-relaxed select-text"
              placeholder="User-agent: *&#10;Allow: /"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-border-default flex justify-end">
            <Button onClick={() => handleSave("robots")} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Robots.txt
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SITEMAP.XML CONFIGURATION & GOOGLE SEARCH CONSOLE NOTE                  */}
      {/* ========================================================================= */}
      {activeSubTab === "sitemap" && (
        <div className="space-y-6">
          {/* Top Banner with Live Sitemap URL */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Auto-Generated XML Sitemap
              </span>
              <p className="text-xs text-slate-800 font-semibold">
                Served dynamically at:{" "}
                <code className="font-mono text-blue-900 font-bold">
                  {(globalSeo.canonical_base_url || "https://ssinternationalcourier.com").replace(/\/+$/, "")}/sitemap.xml
                </code>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySitemapUrl}
                className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 text-xs font-semibold text-blue-900 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSitemap ? "Copied!" : "Copy URL"}</span>
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <span>View Sitemap</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Google Search Console Submission Guide */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-brand-primary shrink-0" />
              <span>How to Submit your Sitemap to Google Search Console</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-600">
              <li>
                Open{" "}
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Google Search Console
                </a>{" "}
                and select your verified domain property.
              </li>
              <li>
                In the left sidebar, navigate to <strong>Indexing &gt; Sitemaps</strong>.
              </li>
              <li>
                In the <strong>&quot;Add a new sitemap&quot;</strong> field, enter <code>sitemap.xml</code> and click <strong>Submit</strong>.
              </li>
              <li>
                Google will queue the sitemap for processing. Verified entries and indexing status will appear within 24-48 hours.
              </li>
            </ol>
          </div>

          {/* Public Pages Sitemap Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-primary">Public Pages in Sitemap</h4>
              <span className="text-[11px] text-text-muted">
                Admin, customer portal, and private tracking URLs are strictly blocked by safety rules.
              </span>
            </div>

            <div className="border border-border-default rounded-xl overflow-hidden divide-y divide-border-default text-xs">
              <div className="bg-slate-100 font-bold text-slate-700 grid grid-cols-12 p-3">
                <div className="col-span-5">Page &amp; Route</div>
                <div className="col-span-2 text-center">In Sitemap</div>
                <div className="col-span-3">Change Frequency</div>
                <div className="col-span-2 text-right">Priority</div>
              </div>

              {publicPages.map((page) => {
                const cfg = sitemapPages[page.path] || {
                  included: true,
                  changefreq: page.defaultChangefreq,
                  priority: page.defaultPriority,
                };
                const pageSeo = pagesSeo[page.path];
                const isNoIndex = Boolean(pageSeo?.noindex);

                return (
                  <div
                    key={page.path}
                    className={`grid grid-cols-12 p-3 items-center hover:bg-slate-50 transition-colors ${
                      isNoIndex ? "bg-rose-50/50" : ""
                    }`}
                  >
                    {/* Page Name & Route */}
                    <div className="col-span-5 space-y-0.5">
                      <div className="font-bold text-slate-900">{page.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{page.path}</div>
                      {isNoIndex && (
                        <span className="inline-block text-[10px] text-rose-600 font-bold">
                          Excluded (Noindex Active)
                        </span>
                      )}
                    </div>

                    {/* Included Toggle */}
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={cfg.included && !isNoIndex}
                        disabled={isNoIndex}
                        onChange={(e) => {
                          setSitemapPages((prev) => ({
                            ...prev,
                            [page.path]: {
                              ...cfg,
                              included: e.target.checked,
                            },
                          }));
                        }}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                      />
                    </div>

                    {/* Change Frequency */}
                    <div className="col-span-3 pr-2">
                      <select
                        value={cfg.changefreq}
                        onChange={(e) => {
                          setSitemapPages((prev) => ({
                            ...prev,
                            [page.path]: {
                              ...cfg,
                              changefreq: e.target.value,
                            },
                          }));
                        }}
                        className="w-full text-xs py-1.5 px-2 rounded-lg border border-border-default bg-white focus:outline-none"
                      >
                        <option value="always">always</option>
                        <option value="hourly">hourly</option>
                        <option value="daily">daily</option>
                        <option value="weekly">weekly</option>
                        <option value="monthly">monthly</option>
                        <option value="yearly">yearly</option>
                        <option value="never">never</option>
                      </select>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2 text-right">
                      <select
                        value={cfg.priority}
                        onChange={(e) => {
                          setSitemapPages((prev) => ({
                            ...prev,
                            [page.path]: {
                              ...cfg,
                              priority: parseFloat(e.target.value),
                            },
                          }));
                        }}
                        className="text-xs py-1.5 px-2 rounded-lg border border-border-default bg-white focus:outline-none font-mono"
                      >
                        <option value="1.0">1.0 (Highest)</option>
                        <option value="0.9">0.9</option>
                        <option value="0.8">0.8</option>
                        <option value="0.7">0.7</option>
                        <option value="0.6">0.6</option>
                        <option value="0.5">0.5 (Default)</option>
                        <option value="0.4">0.4</option>
                        <option value="0.3">0.3</option>
                        <option value="0.2">0.2</option>
                        <option value="0.1">0.1 (Lowest)</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-border-default flex justify-end">
            <Button onClick={() => handleSave("sitemap")} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Sitemap Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
