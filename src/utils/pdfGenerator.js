import jsPDF from "jspdf";

const buildGoogleMapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const addWrappedText = (pdf, text, x, y, maxWidth, lineHeight = 6) => {
  const lines = pdf.splitTextToSize(text || "", maxWidth);

  lines.forEach((line) => {
    if (y > 285) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(line, x, y);
    y += lineHeight;
  });

  return y;
};

const addGoogleMapsLink = (pdf, query, x, y) => {
  const url = buildGoogleMapsUrl(query);
  pdf.setTextColor(37, 99, 235);
  pdf.textWithLink("Open in Google Maps", x, y, { url });
  pdf.setTextColor(0, 0, 0);
  return y + 6;
};

const buildItineraryPDF = (trip) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 28;
  (trip.itinerary_days || []).forEach((day, dayIndex) => {
    if (dayIndex > 0) {
      pdf.addPage();
    }

    let y = 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text(`${trip.destination} Plan`, 14, y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `${trip.start_date} to ${trip.end_date}   Budget: $${trip.budget}/day`,
      14,
      y,
    );
    y += 8;

    if (trip.interests?.length) {
      pdf.text(`Interests: ${trip.interests.join(", ")}`, 14, y);
      y += 10;
    }

    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(12, y - 5, pageWidth - 24, 12, 3, 3);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`Day ${dayIndex + 1}`, 16, y + 2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(day.date || "", pageWidth - 40, y + 2);
    y += 14;

    if (day.food_cost_estimate) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text(`Food estimate: $${day.food_cost_estimate}`, 16, y);
      y += 7;
    }

    (day.activities || []).forEach((activity) => {
      if (y > 272) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`${activity.time || "--:--"}  ${activity.name || "Activity"}`, 16, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      if (activity.location) {
        y = addWrappedText(pdf, `Location: ${activity.location}`, 20, y, contentWidth - 6);
        y = addGoogleMapsLink(pdf, activity.location, 20, y);
      }

      if (activity.description) {
        y = addWrappedText(pdf, activity.description, 20, y, contentWidth - 6);
      }

      if (activity.estimated_cost) {
        pdf.text(`Estimated cost: $${activity.estimated_cost}`, 20, y);
        y += 6;
      }

      y += 3;
    });

    if (day.hotel) {
      if (y > 268) {
        pdf.addPage();
        y = 20;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Accommodation: ${day.hotel.name || "Hotel"}`, 16, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      if (day.hotel.address) {
        y = addWrappedText(pdf, `Address: ${day.hotel.address}`, 20, y, contentWidth - 6);
        y = addGoogleMapsLink(pdf, day.hotel.address, 20, y);
      }

      if (day.hotel.price) {
        pdf.text(`Price: $${day.hotel.price} / night`, 20, y);
        y += 6;
      }

      y += 5;
    } else {
      y += 3;
    }
  });

  return pdf;
};

export const getItineraryPDFFileName = (trip) =>
  trip?.destination
    ? `journeyhub_${trip.destination
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")}_${trip.start_date || "trip"}_${trip.itinerary_days?.length || 0}d.pdf`
    : "journeyhub_trip_plan.pdf";

export const generateItineraryPDFBlob = (trip) => {
  const pdf = buildItineraryPDF(trip);
  return pdf.output("blob");
};
