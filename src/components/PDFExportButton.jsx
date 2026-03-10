import { useEffect, useState } from "react";
import { Download, Eye, Loader2, MapPin, X } from "lucide-react";
import {
  generateItineraryPDFBlob,
  getItineraryPDFFileName,
} from "../utils/pdfGenerator";

const PDFExportButton = ({ trip }) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  useEffect(() => {
    if (!previewOpen) {
      setDownloadReady(false);
    }
  }, [previewOpen]);

  const previewPDF = async () => {
    if (!trip?.itinerary_days?.length) {
      return;
    }

    setLoading(true);

    try {
      setPreviewOpen(true);
      setDownloadReady(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!trip?.itinerary_days?.length) {
      return;
    }

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const pdfBlob = generateItineraryPDFBlob(trip);
      const fileName = getItineraryPDFFileName(trip);
      const downloadBlob = new Blob([pdfBlob], {
        type: isIOS ? "application/octet-stream" : "application/pdf",
      });

      const pdfFile = new File([downloadBlob], fileName, {
        type: downloadBlob.type,
      });

      if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: fileName,
        });
        return;
      }

      const blobUrl = window.URL.createObjectURL(downloadBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.rel = "noopener";
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  return (
    <>
      <button
        onClick={previewPDF}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Preparing PDF</span>
          </>
        ) : (
          <>
            <Eye size={20} />
            <span>PDF</span>
          </>
        )}
      </button>

      {previewOpen ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm">
          <div className="flex h-full flex-col bg-[var(--surface-strong)] md:mx-auto md:my-4 md:h-[calc(100vh-2rem)] md:max-w-5xl md:rounded-[28px] md:border md:border-[var(--border-soft)]">
            <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {getItineraryPDFFileName(trip)}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Preview your full plan
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!downloadReady}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={closePreview}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-200/70 p-3 sm:p-4">
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {(trip.itinerary_days || []).map((day, index) => (
                  <article
                    key={`${day.date}-${index}`}
                    className="rounded-[24px] bg-white p-5 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.12)] sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Page {index + 1} of {trip.itinerary_days.length}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold">
                          {trip.destination} Plan
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                          {trip.start_date} to {trip.end_date} · Budget: $
                          {trip.budget}/day
                        </p>
                        {trip.interests?.length ? (
                          <p className="mt-1 text-sm text-slate-600">
                            Interests: {trip.interests.join(", ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="rounded-2xl border border-slate-200 px-4 py-2 text-right">
                        <p className="text-lg font-semibold">Day {index + 1}</p>
                        <p className="text-sm text-slate-600">{day.date}</p>
                      </div>
                    </div>

                    {day.food_cost_estimate ? (
                      <p className="mt-4 text-sm font-medium text-slate-700">
                        Food estimate: ${day.food_cost_estimate}
                      </p>
                    ) : null}

                    <div className="mt-5 space-y-5">
                      {(day.activities || []).map((activity, activityIndex) => (
                        <div
                          key={`${activity.name}-${activityIndex}`}
                          className="rounded-2xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-lg font-semibold">
                                {activity.time || "--:--"} {activity.name}
                              </p>
                              {activity.location ? (
                                <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                  <span>{activity.location}</span>
                                </p>
                              ) : null}
                            </div>
                            {activity.estimated_cost ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                ${activity.estimated_cost}
                              </span>
                            ) : null}
                          </div>

                          {activity.description ? (
                            <p className="mt-3 text-sm leading-6 text-slate-700">
                              {activity.description}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {day.hotel ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                        <p className="text-lg font-semibold">
                          Accommodation: {day.hotel.name}
                        </p>
                        {day.hotel.address ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {day.hotel.address}
                          </p>
                        ) : null}
                        {day.hotel.price ? (
                          <p className="mt-2 text-sm font-semibold text-slate-800">
                            ${day.hotel.price} / night
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default PDFExportButton;
