/**
 * Room tariff resolution — reads the hospital's own published tariff card
 * instead of a national average.
 *
 * Why this exists: costController carried a DEFAULT_ROOM_TARIFFS table
 * (GENERAL 1800 / SEMI_PRIVATE 3500 / PRIVATE_AC 6500 / DELUXE 11000 /
 * SUITE 22000) that happened to be Manipal Old Airport Road's exact price
 * list. Every other hospital was quoted Manipal's rates. For KEM Mumbai the
 * general ward is ₹200/day and for Victoria Government it is ₹100/day, so the
 * hardcoded 1800 overstated the room bill by 9-18x — and room tariff is the
 * single input that drives proportionate deduction, so the error propagated
 * into the whole coverage estimate.
 *
 * public.hospital_rooms holds 36 real rows. This service reads them.
 */
import { dataRepository } from './dataRepository';
import { RoomCategoryCode, type RoomCategory } from '../types/domain';

/** Ordering used to find "the best room this hospital publishes at or below X". */
const ROOM_RANK: Record<RoomCategoryCode, number> = {
  [RoomCategoryCode.GENERAL]: 1,
  [RoomCategoryCode.SEMI_PRIVATE]: 2,
  [RoomCategoryCode.PRIVATE_AC]: 3,
  [RoomCategoryCode.DELUXE]: 4,
  [RoomCategoryCode.SUITE]: 5,
  // ANY_ROOM is an entitlement, not a physical room. Rank it above every real
  // category so "at or below ANY_ROOM" means "the top room on offer".
  [RoomCategoryCode.ANY_ROOM]: 99
};

export interface PublishedRoomTariff {
  code: RoomCategoryCode;
  name: string;
  rank: number;
  room_category_id: string;
  tariff_per_day: number;
  total_rooms?: number;
}

function roomCategoryByCode(code: RoomCategoryCode): RoomCategory | undefined {
  return dataRepository.roomCategories.find((rc) => rc.code === code);
}

/**
 * Every room category this hospital actually publishes a tariff for,
 * cheapest first. Empty array means the hospital has no tariff card on record.
 */
export function getPublishedRoomTariffs(hospitalId: string): PublishedRoomTariff[] {
  const rooms = dataRepository.getHospitalRooms(hospitalId);
  const categories = dataRepository.roomCategories;

  return rooms
    .map((room): PublishedRoomTariff | null => {
      const category = categories.find((rc) => rc.id === room.room_category_id);
      if (!category) return null;
      return {
        code: category.code,
        name: category.name,
        rank: category.rank,
        room_category_id: room.room_category_id,
        tariff_per_day: Number(room.tariff_per_day),
        total_rooms: room.total_rooms
      };
    })
    .filter((r): r is PublishedRoomTariff => r !== null)
    .sort((a, b) => a.rank - b.rank);
}

/**
 * The hospital's published tariff for one category, or undefined when this
 * hospital does not offer it. Undefined is a real answer — do not substitute
 * another hospital's price for it.
 */
export function getRoomTariff(
  hospitalId: string,
  code: RoomCategoryCode
): PublishedRoomTariff | undefined {
  if (code === RoomCategoryCode.ANY_ROOM) return undefined;
  const category = roomCategoryByCode(code);
  if (!category) return undefined;
  return getPublishedRoomTariffs(hospitalId).find((r) => r.room_category_id === category.id);
}

/**
 * The entitlement ceiling in this hospital's own price list.
 *
 * A policy that entitles the patient to DELUXE at a hospital whose top room is
 * PRIVATE_AC is entitled to that hospital's PRIVATE_AC rate — the cap is
 * bounded by what is actually on offer. Returns undefined only when the
 * hospital publishes no rooms at all.
 */
export function getEligibleRoomTariff(
  hospitalId: string,
  eligibility: RoomCategoryCode
): PublishedRoomTariff | undefined {
  const published = getPublishedRoomTariffs(hospitalId);
  if (published.length === 0) return undefined;

  const exact = getRoomTariff(hospitalId, eligibility);
  if (exact) return exact;

  const ceiling = ROOM_RANK[eligibility] ?? ROOM_RANK[RoomCategoryCode.PRIVATE_AC];
  const atOrBelow = published.filter((r) => (ROOM_RANK[r.code] ?? r.rank) <= ceiling);
  // Highest room at or below the entitlement; if none qualifies (entitlement is
  // below this hospital's cheapest room) the cheapest room is the honest floor.
  return atOrBelow.length > 0 ? atOrBelow[atOrBelow.length - 1] : published[0];
}
