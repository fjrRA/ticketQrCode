import { fetchDestinationDetail } from "@/modules/destination/controller/fetchDetail";
import { DestinationData } from "@/types/destination";  // Import tipe data destinasi
import MapEmbed from "@/components/user/destination/MapEmbed";
import FacilityList from "@/components/user/destination/FacilityList";
import GalleryList from "@/components/user/destination/GalleryList";
import OperatingHoursList from "@/components/user/destination/OperatingHoursList";
import ReviewList from "@/components/user/destination/ReviewList";
import TicketList from "@/components/user/destination/TicketList";
import { notFound } from "next/navigation";
import { Facility } from "@/types/facility";
import { Gallery } from "@/types/gallery";
import { OperatingHour } from "@/types/operating-hours";
import { Review } from "@/types/review";
import { Ticket } from "@/types/ticket";
import { Decimal } from "@prisma/client/runtime/library";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DetailDestinationPage({ params }: { params: { slug: string } }) {
  const data: DestinationData | null = await fetchDestinationDetail(params.slug);
  if (!data) return notFound();

  // Menangani data dengan tipe DestinationData
  const filteredFacilities = data.facility_tourisms
    .filter((f: { facility: Facility | null }) => f.facility !== null)
    .map(f => ({
      facility: {
        facility_name: f.facility?.facility_name ?? '',
        facility_icon: f.facility?.facility_icon ?? null
      }
    }));

  console.log("FACILITIES:", filteredFacilities);

  const galleries: Gallery[] = data.galleries.map((gallery: { gallery_id: string, spot_id: string | null, gallery_img: string | null, gallery_caption: string | null }) => ({
    gallery_id: gallery.gallery_id,
    spot_id: gallery.spot_id ?? '',
    gallery_img: gallery.gallery_img ?? '',
    gallery_caption: gallery.gallery_caption ?? 'No caption',
  }));

  const operatingHours: OperatingHour[] = data.operating_hours.map((operating: { operating_id: string, spot_id: string | null, operating_day: string, hours_open: Date, hours_closed: Date }) => ({
    operating_id: operating.operating_id,
    spot_id: operating.spot_id,
    operating_day: operating.operating_day,
    hours_open: new Date(operating.hours_open).toLocaleTimeString(),
    hours_closed: new Date(operating.hours_closed).toLocaleTimeString(),
  }));

  const reviews: Review[] = data.reviews.map((review: { reviews_id: string, spot_id: string | null, user_id: string | null, reviews_rating: number | null, reviews_desc: string | null, reviews_created_at: Date | null }) => ({
    reviews_id: review.reviews_id,
    spot_id: review.spot_id,
    user_id: review.user_id,
    reviews_rating: review.reviews_rating ?? 0,
    reviews_desc: review.reviews_desc ?? 'No description',
    reviews_created_at: review.reviews_created_at ? review.reviews_created_at.toISOString() : '',
  }));

  const tickets: Ticket[] = data.tickets.map((ticket: { ticket_id: string, spot_id: string | null, ticket_name: string | null, ticket_price: Decimal, ticket_desc: string | null, ticket_stock: number | null, code: string, url_qr: string }) => ({
    ticket_id: ticket.ticket_id,
    spot_id: ticket.spot_id ?? '',
    ticket_name: ticket.ticket_name ?? 'No ticket name',
    ticket_price: parseFloat(ticket.ticket_price.toString()),
    ticket_desc: ticket.ticket_desc ?? 'No description',
    ticket_stock: ticket.ticket_stock ?? 0,
    code: ticket.code,
    url_qr: ticket.url_qr,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">{data.spot_name}</h1>
      <p className="text-gray-600">{data.spot_desc}</p>

      <div>
        <h2 className="text-lg font-medium mb-1">Alamat</h2>
        <p className="text-sm text-gray-700">{data.spot_address}</p>
      </div>

      {data.spot_maps && <MapEmbed mapsUrl={data.spot_maps} />}
      <div>
        <h2 className="text-lg font-medium mb-1">Kategori Wisata</h2>
        {data.category ? <div>{data.category.category_name}</div> : <div>No category available</div>}
      </div>
      {data.village && (
        <div>
          <h2 className="text-lg font-medium mb-1">Desa</h2>
          <p className="text-sm text-gray-700">
            {data.village.village_name}, {data.village.village_city}
          </p>
        </div>
      )}
      {filteredFacilities.length > 0 && <FacilityList facilities={filteredFacilities} />}
      {galleries.length > 0 && <GalleryList items={galleries} />}
      {operatingHours.length > 0 && <OperatingHoursList hours={operatingHours} />}
      {reviews.length > 0 && <ReviewList reviews={reviews} />}
      {tickets.length > 0 && <TicketList tickets={tickets} />}
    </div>
  );
}
