import type { AccountStatus, Visibility } from "../shared/blackwaterleaf-contract-v1";

export function isResourceOwner(viewerId: number, ownerId: number): boolean {
  return viewerId === ownerId;
}

export function canReadProfile(input: {
  viewerId: number | null;
  ownerId: number;
  ownerStatus: AccountStatus;
  visibility: Visibility;
}): boolean {
  if (input.viewerId !== null && isResourceOwner(input.viewerId, input.ownerId)) return true;
  return input.ownerStatus === "active" && input.visibility === "public";
}

export function canReadObservation(input: {
  viewerId: number | null;
  ownerId: number;
  ownerStatus: AccountStatus;
  visibility: Visibility;
}): boolean {
  if (input.viewerId !== null && isResourceOwner(input.viewerId, input.ownerId)) return true;
  return input.ownerStatus === "active" && input.visibility === "public";
}

export function canReadCommunityPost(input: {
  authorStatus: AccountStatus;
  visibility: Visibility;
  publicationStatus: "draft" | "published" | "hidden" | "removed";
}): boolean {
  return input.authorStatus === "active" && input.visibility === "public" && input.publicationStatus === "published";
}
